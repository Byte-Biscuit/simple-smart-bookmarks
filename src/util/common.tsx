import { createContext } from "react"
import { createFromIconfontCN } from "@ant-design/icons"
import "../style/iconfont/iconfont.js"
import { Storage } from "@plasmohq/storage"
import * as cheerio from "cheerio"
import type {
    BookmarkInspection,
    BookmarkListHeader,
    BookmarkTreeNode,
    FrequentlyVisitedWebsite
} from "~util/types"

/**
 * Using IconFont
 */
export const LocalIcon = createFromIconfontCN({
    scriptUrl: ""
})

/**
 * Get the favicon icon information by Url
 * @param url
 */
export const getDefaultFaviconFromUrl = (url: string) => {
    try {
        return new URL(url).origin + "/favicon.ico"
    } catch (err) {}
    return ""
}

/**
 * Get favicon
 * @param content
 * @param url
 */
const getFavicon = (content: string, url: string) => {
    try {
        // Full http(s) path
        if (/^https?:.*/gm.test(content)) {
            return content
        }
        // Missing protocol
        if (/^\/\/.*/gm.test(content)) {
            return new URL(url).protocol + content
        }
        // Absolute path
        if (/^\/.*/gm.test(content)) {
            return new URL(url).origin + content
        }
        // Reletive path
        return new URL(url).origin + "/" + content
    } catch (err) {
        console.error("Error resolving favicon URL:", err)
    }
    // default
    return getDefaultFaviconFromUrl(url)
}

/**
 * Cache
 */
const syncStorage = new Storage({
    area: "sync"
})
const storage = new Storage({
    area: "local"
})
export const getSyncCache = async (key: string) => {
    return await syncStorage.get(key)
}
export const getCache = async (key: string) => {
    return await storage.get(key)
}
export const setSyncCache = async (key: string, value: any) => {
    await syncStorage.set(key, value)
}
export const setCache = async (key: string, value: any) => {
    await storage.set(key, value)
}
export const removeSyncCache = async (key: string) => {
    return await syncStorage.remove(key)
}
export const removeCache = async (key: string) => {
    return await storage.remove(key)
}
export const clearSyncCache = async () => {
    return await syncStorage.clear()
}
export const clearCache = async () => {
    return await storage.clear()
}

export const websiteInspect = async (url: string): Promise<any> => {
    let status: number
    let favicon = getDefaultFaviconFromUrl(url)
    let title = ""
    let keywords = ""
    let description = ""
    let response: Response = null
    try {
        response = await fetch(url, { method: "GET" })
    } catch (err) {
        console.error("Initial fetch error:", err)
        try {
            response = await fetch(url, { mode: "no-cors", method: "GET" })
        } catch (corsErr) {
            console.error("No-cors fetch error:", corsErr)
        }
    }
    if (response == null || !response.ok) {
        // @ts-ignore
        return {
            url,
            title,
            keywords,
            description,
            status: response ? response.status : 500,
            favicon
        }
    }
    status = response.status
    if (response.ok) {
        let content = await response.text()
        let $ = cheerio.load(content)
        title = $("title").text()
        keywords = $("meta[name='keywords']").attr("content")
        description = $("meta[name='description']").attr("content")
        let faviconContent =
            $("link[rel='icon']").attr("href") ||
            $("link[rel='shortcut icon']").attr("href")
        if (faviconContent) {
            favicon = getFavicon(faviconContent, url)
        }
    }

    // @ts-ignore
    return {
        url,
        title,
        keywords,
        description,
        status,
        favicon
    }
}

export const bookmarkInspect = async (
    url: string
): Promise<BookmarkInspection> => {
    let inspectContent = await websiteInspect(url)
    return {
        ...inspectContent
    }
}

/**
 * Common constants
 */
export const Constants = {
    SORT_DESC: "desc",
    SORT_ASC: "asc",
    DEFAULT_RECENT_BOOKMARK_NUMBER: 30,
    CACHE_KEY_FREQUENTLY_VISITED_WEBSITE: "frequently-visited-website",
    DEFAULT_SEARCH_ENGINES: [
        { name: "bing", url: "https://www.bing.com/search?q=", default: "0" },
        { name: "baidu", url: "https://www.baidu.com/s?wd=", default: "0" },
        {
            name: "google",
            url: "https://www.google.com/search?q=",
            default: "1"
        }
    ],
    CACHE_KEY_SEARCH_ENGINES: "search-engines",
    CACHE_KEY_DEFAULT_SEARCH_ENGINE: "default-search-engine",
    CACHE_KEY_SEARCH_DIALOG_SHOW: "search-dialog-show",
    FREQUENTLY_VISITED_WEBSITE_CONTAINER: {
        elementWidth: 80,
        elementHeight: 80,
        elementMarginX: 8
    }
}

const _bookmarkSortedDesc = (o1: BookmarkTreeNode, o2: BookmarkTreeNode) => {
    if (o1.dateAdded > o2.dateAdded) {
        return -1
    }
    if (o1.dateAdded < o2.dateAdded) {
        return 1
    }
    return 0
}
const _bookmarkSortedAsc = (o1: BookmarkTreeNode, o2: BookmarkTreeNode) => {
    if (o1.dateAdded > o2.dateAdded) {
        return 1
    }
    if (o1.dateAdded < o2.dateAdded) {
        return -1
    }
    return 0
}
/**
 * Get the child node information of the specified node
 * @param id
 * @param sort
 */
export const getBookmarkChildren = async (id: string, sort: string) => {
    let res = (await chrome.bookmarks.getChildren(id)) as BookmarkTreeNode[]
    sort === Constants.SORT_ASC
        ? res.sort(_bookmarkSortedAsc)
        : res.sort(_bookmarkSortedDesc)
    return res
}

/**
 * Bookmarks NewTab Context
 */
export const NewtabContext = createContext<{
    bookmarkListHeaders: BookmarkListHeader[]
    setBookmarkListHeaders: (headers: BookmarkListHeader[]) => void
    bookmarkList: BookmarkTreeNode[]
    setBookmarkList: (bookmarkList: BookmarkTreeNode[]) => void
    frequentlyVisitedWebsites: {
        first: FrequentlyVisitedWebsite[]
        other: FrequentlyVisitedWebsite[]
    }
    setFrequentlyVisitedWebsites: ({
        first,
        other
    }: {
        first: FrequentlyVisitedWebsite[]
        other: FrequentlyVisitedWebsite[]
    }) => void
    frequentlyVisitedWebsiteContainerWidth: number
    setFrequentlyVisitedWebsiteContainerWidth: (width: number) => void
} | null>(null)

/**
 * Bookmarks Search
 */
export const bookmarkSearch = (keyword: string) => {
    return chrome.bookmarks.search({ query: keyword })
}

/**
 * After add or remove frequently visited website,relayout websites view
 * @param containerWidth
 */
export const resetFrequentlyVisitedWebsiteLayout = async (
    containerWidth: number
) => {
    let _limit = Math.trunc(
        containerWidth /
            Constants.FREQUENTLY_VISITED_WEBSITE_CONTAINER.elementWidth
    )
    let limit =
        _limit -
        Math.round(
            (Constants.FREQUENTLY_VISITED_WEBSITE_CONTAINER.elementMarginX *
                2 *
                _limit) /
                Constants.FREQUENTLY_VISITED_WEBSITE_CONTAINER.elementWidth
        )
    let websites =
        (await getSyncCache(Constants.CACHE_KEY_FREQUENTLY_VISITED_WEBSITE)) ||
        []
    let _websites = websites as FrequentlyVisitedWebsite[]
    // sorted by ranking and createTime
    _websites.sort((a, b) => {
        if (a.ranking > b.ranking) {
            return -1
        } else if (a.ranking < b.ranking) {
            return 1
        } else {
            if (a.createTime > b.createTime) {
                return -1
            } else {
                return 1
            }
        }
    })
    if (_websites?.length > limit) {
        return {
            first: _websites.slice(0, limit),
            other: _websites.slice(limit)
        }
    }
    return {
        first: _websites,
        other: []
    }
}
/**
 * Update frequently visited website ranking
 * @param id
 */
export const updateFrequentlyVisitedWebsiteRanking = async (id: string) => {
    let websites =
        (await getSyncCache(Constants.CACHE_KEY_FREQUENTLY_VISITED_WEBSITE)) ||
        []
    let _websites = websites as FrequentlyVisitedWebsite[]
    let _websites0 = _websites.map((it) => {
        if (it.id == id) {
            it.ranking = it.ranking + 1
            return it
        }
        return it
    })
    setCache(Constants.CACHE_KEY_FREQUENTLY_VISITED_WEBSITE, _websites0).then()
}

export const stringToBoolean = (str: string): boolean => {
    if (str == null) return false
    if (typeof str == "boolean") return str
    let cnt = str.trim().toLowerCase()
    return !(cnt === "0" || cnt == "false")
}

/**
 * Extended string hashCode
 * From: https://stackoverflow.com/
 */
export const hashCode = (cnt: string): string => {
    let hash = 0,
        i,
        chr
    if (cnt.length === 0) return "0"
    for (i = 0; i < cnt.length; i++) {
        chr = cnt.charCodeAt(i)
        hash = (hash << 5) - hash + chr
        // Convert to 32bit integer
        hash |= 0
    }
    return hash + ""
}
