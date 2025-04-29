import { type Component, component, asString, all, on, toggleClass, dangerouslySetInnerHTML, first, computed } from '../../../'

export type ClientRouterProps = {
    pathname: string
}

export default component('client-router', {
    pathname: window.location.pathname
}, el => {
    const outlet = asString('main')(el, el.getAttribute('outlet'))

    const content = computed(async abort => {
        const url = String(new URL(el.pathname, window.location.origin))
        if (abort?.aborted || !url) return ''

        try {
            const response = await fetch(url)
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            
            const html = await response.text()
            const doc = new DOMParser().parseFromString(html, 'text/html')
    
            // Update title
            const newTitle = doc.querySelector('title')?.textContent
            if (newTitle) document.title = newTitle
            
            // Update URL and return outlet content
            window.history.pushState({}, '', url)
            return doc.querySelector(outlet)?.innerHTML ?? ''
        } catch (error) {
            console.error('Navigation failed:', error)
            return ''
        }
    })

    return [
        all('a[href]',
            toggleClass('active',
                () => el.pathname === new URL(el.getAttribute('href') ?? '').pathname
            ),
            on('click', (e: Event) => {
                const link = e.target as HTMLAnchorElement
                const url = new URL(link.href)
                if (url.origin === window.location.origin) {
                    e.preventDefault()
                    el.pathname = url.pathname
                }
            })
        ),

        // Render initial content
        first(outlet, dangerouslySetInnerHTML(content, undefined, true)),

        // Handle browser history navigation
        () => {
            const handlePopState = () => {
                el.pathname = window.location.pathname
            }
            window.addEventListener('popstate', handlePopState)
            return () => {
                window.removeEventListener('popstate', handlePopState)
            }
        }
    ]
})

declare global {
  interface HTMLElementTagNameMap {
    'client-router': Component<ClientRouterProps>
  }
}