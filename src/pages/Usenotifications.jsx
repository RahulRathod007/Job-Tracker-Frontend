import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserApplications } from '../services/api'

const STORAGE_KEY    = 'jp_notifications'
const SEEN_KEY       = 'jp_notif_seen_ids'
const STATUS_KEY     = 'jp_last_statuses'
const POLL_INTERVAL  = 15000

const STATUS_META = {
  APPLIED:             { msg: 'Your application was received.',             icon: 'bi-send-check-fill',     color: '#a29bfe' },
  RESUME_VIEWED:       { msg: 'An employer viewed your resume!',            icon: 'bi-eye-fill',            color: '#00d2ff' },
  SHORTLISTED:         { msg: "You've been shortlisted! \uD83C\uDF89",      icon: 'bi-star-fill',           color: '#f7b731' },
  INTERVIEW_SCHEDULED: { msg: 'Interview scheduled — check your email.',    icon: 'bi-calendar-check-fill', color: '#43e97b' },
  HIRED:               { msg: "Congratulations! You've been hired! \uD83C\uDF8A", icon: 'bi-trophy-fill',  color: '#43e97b' },
  REJECTED:            { msg: 'Your application was not selected.',         icon: 'bi-x-circle-fill',       color: '#ff6584' },
}

const loadStored       = ()      => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
const saveStored       = (n)     => localStorage.setItem(STORAGE_KEY, JSON.stringify(n.slice(0, 50)))
const loadSeen         = ()      => { try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) } catch { return new Set() } }
const saveSeen         = (s)     => localStorage.setItem(SEEN_KEY, JSON.stringify([...s]))
const loadLastStatuses = (uid)   => { try { return JSON.parse(localStorage.getItem(STATUS_KEY + '_' + uid) || '{}') } catch { return {} } }
const saveLastStatuses = (uid,m) => localStorage.setItem(STATUS_KEY + '_' + uid, JSON.stringify(m))

export default function useNotifications(user) {
  const isJobSeeker = user?.role?.toLowerCase() === 'jobseeker'
  const uid         = user?.userId

  const [notifications, setNotifications] = useState(loadStored)
  const [unreadCount,   setUnreadCount]   = useState(0)

  const lastStatuses = useRef({})
  const initialized  = useRef(false)

  const recalcUnread = useCallback((notifs) => {
    const seen = loadSeen()
    setUnreadCount(notifs.filter(n => !seen.has(n.id)).length)
  }, [])

  const fetchAndDiff = useCallback(async () => {
    if (!uid || !isJobSeeker) return
    try {
      const res  = await getUserApplications(uid)
      const apps = Array.isArray(res.data) ? res.data : []
      const newNotifs  = []
      const updatedMap = { ...lastStatuses.current }

      apps.forEach(app => {
        const appId  = String(app.applicationId)
        const status = app.status
        const prev   = lastStatuses.current[appId]

        if (!initialized.current) {
          // First ever fetch — seed silently
          updatedMap[appId] = status
          return
        }

        if (prev !== status && STATUS_META[status]) {
          // Skip APPLIED notification for brand-new apps (never seen before)
          if (prev === undefined && status === 'APPLIED') {
            updatedMap[appId] = status
            return
          }
          const notifId = appId + '-' + status
          const already = loadStored().some(n => n.id === notifId)
          if (!already) {
            const meta = STATUS_META[status]
            newNotifs.push({
              id:        notifId,
              appId,
              jobTitle:  app.job?.title       || 'a position',
              company:   app.job?.companyName || '',
              status,
              message:   meta.msg,
              icon:      meta.icon,
              color:     meta.color,
              timestamp: new Date().toISOString(),
            })
          }
          updatedMap[appId] = status
        }
      })

      lastStatuses.current = updatedMap
      saveLastStatuses(uid, updatedMap)
      initialized.current = true

      if (newNotifs.length > 0) {
        setNotifications(prev => {
          const merged = [...newNotifs, ...prev].slice(0, 50)
          saveStored(merged)
          recalcUnread(merged)
          return merged
        })
      }
    } catch { /* ignore */ }
  }, [uid, isJobSeeker, recalcUnread])

  useEffect(() => {
    if (!uid || !isJobSeeker) return

    // Restore persisted statuses — survives page refresh
    const persisted = loadLastStatuses(uid)
    lastStatuses.current = persisted
    initialized.current  = Object.keys(persisted).length > 0

    const stored = loadStored()
    setNotifications(stored)
    recalcUnread(stored)

    // Fetch immediately on mount
    fetchAndDiff()

    const timer = setInterval(fetchAndDiff, POLL_INTERVAL)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, isJobSeeker])

  const markAllRead = useCallback(() => {
    const seen = loadSeen()
    loadStored().forEach(n => seen.add(n.id))
    saveSeen(seen)
    setUnreadCount(0)
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    saveStored([])
    saveSeen(new Set())
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, markAllRead, clearAll }
}