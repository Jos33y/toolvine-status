// Status page interactivity. Vanilla. No framework. Progressive enhancement.

(function () {
    'use strict'

    // ============ Toast ============

    const toastEl = document.getElementById('toast')
    let toastTimer = null

    function showToast(message) {
        if (!toastEl) return
        toastEl.textContent = message
        toastEl.classList.add('is-visible')
        if (toastTimer) clearTimeout(toastTimer)
        toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 1800)
    }


    // ============ Copy to clipboard ============

    function setupCopyButtons() {
        const buttons = document.querySelectorAll('.js-copy')
        buttons.forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault()
                const url = btn.getAttribute('data-url')
                if (!url) return

                const ok = await copyText(url)
                if (ok) {
                    btn.classList.add('is-copied')
                    showToast('Copied to clipboard')
                    setTimeout(() => btn.classList.remove('is-copied'), 1400)
                } else {
                    showToast('Copy failed. Long-press to select.')
                }
            })
        })
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try { await navigator.clipboard.writeText(text); return true } catch (_) { /* fall through */ }
        }
        const ta = document.createElement('textarea')
        ta.value = text
        ta.setAttribute('readonly', '')
        ta.style.position = 'fixed'; ta.style.opacity = '0'; ta.style.pointerEvents = 'none'
        document.body.appendChild(ta)
        ta.select()
        try {
            const ok = document.execCommand('copy')
            document.body.removeChild(ta)
            return ok
        } catch (_) {
            document.body.removeChild(ta)
            return false
        }
    }


    // ============ Scroll-triggered reveals ============

    // Each .reveal section fades up when it enters viewport. Inside the section,
    // grid items cascade in with a small per-item delay so the eye is guided
    // rather than overwhelmed.

    const CHILD_SELECTORS = '.card, .check, .step, .beyond__item, .next-card, .payment, .need, .log__entry, .quicklink, .email-row:not(.email-row--head)'
    const STAGGER_MS = 55
    const STAGGER_CAP_MS = 600

    function setupRevealObserver() {
        // If IntersectionObserver is missing, fall back to showing everything.
        if (typeof IntersectionObserver === 'undefined') {
            document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in-view'))
            document.querySelectorAll(CHILD_SELECTORS).forEach((el) => el.classList.add('is-in-view'))
            return
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return
                const target = entry.target
                target.classList.add('is-in-view')

                // Cascade children
                const items = target.querySelectorAll(CHILD_SELECTORS)
                items.forEach((item, i) => {
                    const delay = Math.min(i * STAGGER_MS, STAGGER_CAP_MS)
                    item.style.transitionDelay = delay + 'ms'
                    // Use requestAnimationFrame so the class lands on the next paint
                    requestAnimationFrame(() => item.classList.add('is-in-view'))
                })

                observer.unobserve(target)
            })
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -6% 0px'
        })

        document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    }


    // ============ Scroll progress bar ============

    function setupScrollProgress() {
        const bar = document.getElementById('scrollProgress')
        if (!bar) return

        let ticking = false
        function update() {
            const doc = document.documentElement
            const max = doc.scrollHeight - doc.clientHeight
            const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0
            bar.style.width = pct + '%'
            ticking = false
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true }
        }, { passive: true })
        update()
    }


    // ============ Topbar shadow on scroll ============

    function setupTopbarShadow() {
        const topbar = document.getElementById('topbar')
        if (!topbar) return

        let ticking = false
        function update() {
            const y = document.documentElement.scrollTop || document.body.scrollTop
            topbar.classList.toggle('is-scrolled', y > 8)
            ticking = false
        }
        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true }
        }, { passive: true })
        update()
    }


    // ============ Relative timestamps ============

    function setupRelativeTimes() {
        const nodes = document.querySelectorAll('.js-relative')
        if (!nodes.length) return
        const now = new Date()
        nodes.forEach((node) => {
            const iso = node.getAttribute('datetime')
            if (!iso) return
            const then = new Date(iso)
            if (Number.isNaN(then.getTime())) return
            const rel = formatRelative(now, then)
            if (rel) {
                if (!node.getAttribute('title')) node.setAttribute('title', node.textContent.trim())
                node.textContent = rel
            }
        })
    }

    function formatRelative(now, then) {
        const diffSec = Math.round((now - then) / 1000)
        if (Math.abs(diffSec) < 60) return 'just now'
        const minutes = Math.round(diffSec / 60)
        if (Math.abs(minutes) < 60) return labelize(minutes, 'minute')
        const hours = Math.round(diffSec / 3600)
        if (Math.abs(hours) < 24) return labelize(hours, 'hour')
        const days = Math.round(diffSec / 86400)
        if (Math.abs(days) < 7) return labelize(days, 'day')
        return null
    }
    function labelize(v, unit) {
        const abs = Math.abs(v); const plural = abs === 1 ? unit : unit + 's'
        return v > 0 ? abs + ' ' + plural + ' ago' : 'in ' + abs + ' ' + plural
    }


    // ============ Anchor focus management ============

    function setupAnchorFocus() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]')
            if (!link) return
            const href = link.getAttribute('href')
            if (!href || href === '#') return
            const target = document.querySelector(href)
            if (!target) return
            setTimeout(() => {
                target.setAttribute('tabindex', '-1')
                target.focus({ preventScroll: true })
            }, 320)
        })
    }


    // ============ Init ============

    function init() {
        setupCopyButtons()
        setupRelativeTimes()
        setupAnchorFocus()
        setupScrollProgress()
        setupTopbarShadow()
        setupRevealObserver()
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init)
    } else {
        init()
    }
})()
