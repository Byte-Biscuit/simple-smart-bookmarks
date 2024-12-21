import React, { useEffect, useState, useRef } from "react"
import { Menu, Select, FloatButton, Button, ConfigProvider } from "antd"
import BookmarkList from "./bookmark_list"
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons"
import type {
    BookmarkListHeader,
    BookmarkTreeNode,
    FrequentlyVisitedWebsite
} from "~util/types"
import {
    Constants,
    NewtabContext,
    getBookmarkChildren,
    countBookmarks
} from "~util/common"
import { getAntdLocale, i18n } from "~locales"
import "../tailwind.css"
import intl from "react-intl-universal"
import logo from "data-base64:../../assets/logo.png"

const DEFAULT_BOOKMARKS_SELECTED_ID = "1"

// collapse button style class
const COLLAPSE_BUTTON_CLASS =
    "text-xl text-emerald-600 bg-emerald-100 p-2 rounded-full shadow-md border border-emerald-300 hover:bg-emerald-200 hover:text-emerald-700 transition-all duration-300 cursor-pointer"

const BOOKMARKS_MAPPING = new Map<string, BookmarkTreeNode[]>()

const NewTab: React.FC<{}> = (props) => {
    const [bookmarks, setBookmarks] = useState<BookmarkTreeNode>(null)
    const [
        frequentlyVisitedWebsiteContainerWidth,
        setFrequentlyVisitedWebsiteContainerWidth
    ] = useState<number>(0)
    const [frequentlyVisitedWebsites, setFrequentlyVisitedWebsites] = useState<{
        first: FrequentlyVisitedWebsite[]
        other: FrequentlyVisitedWebsite[]
    }>({
        first: [],
        other: []
    })
    const [bookmarkListHeaders, setBookmarkListHeaders] = useState<
        BookmarkListHeader[]
    >([])
    const [bookmarkList, setBookmarkList] = useState<BookmarkTreeNode[]>([])
    const [bookmarkNum, setBookmarkNum] = useState<number>(0)
    const [menus, setMenus] = useState([])

    const [isMouseInLeftBookmarkFolder, setMouseInLeftBookmarkFolder] =
        useState<boolean>(false)

    const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true)
    useEffect(() => {
        const storedState = localStorage.getItem("sidebarVisible")
        if (storedState !== null) {
            setIsSidebarVisible(JSON.parse(storedState))
        }
    }, [])
    const toggleSidebar = () => {
        setIsSidebarVisible((prev) => {
            const newState = !prev
            localStorage.setItem("sidebarVisible", JSON.stringify(newState))
            return newState
        })
    }

    const [isSticky, setIsSticky] = useState<boolean>(false)
    const leftPartRef = useRef<HTMLDivElement>(null)
    const handleScroll = () => {
        const offset = leftPartRef.current.scrollTop
        setIsSticky(offset > 0)
    }

    useEffect(() => {
        const container = leftPartRef.current
        container?.addEventListener("scroll", handleScroll)
        return () => {
            container?.removeEventListener("scroll", handleScroll)
        }
    }, [])

    // Counting bookmark
    useEffect(() => {
        countBookmarks().then((count) => setBookmarkNum(count))
    }, [])

    /**
     * Update bookmark list and header
     * @param key
     * @param keyPath
     */
    const updateList = (key: string, keyPath: string[]) => {
        let ids: string[] = [key]
        if (keyPath != null && keyPath.length != 0) {
            ids = keyPath.reverse()
        }
        chrome.bookmarks.get(ids).then((res) => {
            let headers = []
            for (const item of res) {
                let bookmark = item as BookmarkTreeNode
                headers.push({ title: bookmark?.title, id: bookmark.id })
            }
            setBookmarkListHeaders(headers)
        })
        getBookmarkChildren(key, Constants.SORT_DESC).then((res) => {
            setBookmarkList(res)
        })
    }

    /**
     * Constructing the bookmarks menu
     * @param children
     * @param keyPath
     */
    const constructMenu = async (
        children: BookmarkTreeNode[],
        keyPath: string[]
    ) => {
        let menus = []
        for (const item of children) {
            if (item?.dateGroupModified != null) {
                let subChildren = await getBookmarkChildren(
                    item.id,
                    Constants.SORT_DESC
                )
                let menuItem = {
                    disabled: false,
                    key: item.id,
                    label: item.title,
                    title: item.title,
                    onTitleClick: ({ key, _ }) => {
                        if (keyPath != null && keyPath.length != 0) {
                            updateList(key, [item.id, ...keyPath])
                        } else {
                            updateList(key, [item.id])
                        }
                    },
                    icon: (
                        <img
                            src={logo}
                            alt={"icon"}
                            style={{ width: "16px", height: "auto" }}
                        />
                    )
                }
                let childMenu = await constructMenu(subChildren, [
                    item.id,
                    ...(keyPath || [])
                ])
                if (childMenu.length !== 0) {
                    menuItem["children"] = childMenu
                }
                menus.push(menuItem)
            }
        }
        return menus.sort((o1, o2) => {
            if (o1.title > o2.title) {
                return 1
            }
            if (o1.title < o2.title) {
                return -1
            }
            return 0
        })
    }

    useEffect(() => {
        // i18n
        i18n().then(() => {
            setBookmarkListHeaders([
                {
                    id: "-1",
                    title: intl.get("recent-bookmarks").d("Recent Bookmarks")
                }
            ])
            chrome.bookmarks
                .getTree()
                .then(async (res) => {
                    if (res.length != 0) {
                        let localBookmarkBars =
                            res[0] as unknown as BookmarkTreeNode
                        setBookmarks(localBookmarkBars)
                        localBookmarkBars?.children.forEach((item) => {
                            BOOKMARKS_MAPPING.set(item.id, item.children)
                        })
                    }
                    setMenus(
                        await constructMenu(
                            BOOKMARKS_MAPPING.get(
                                DEFAULT_BOOKMARKS_SELECTED_ID
                            ),
                            []
                        )
                    )
                    // Recent bookmarks
                    chrome.bookmarks
                        .getRecent(Constants.DEFAULT_RECENT_BOOKMARK_NUMBER)
                        .then((data) => {
                            setBookmarkList(data as BookmarkTreeNode[])
                        })
                })
                .catch((err) => {
                    console.log(err)
                })
        })
    }, [])
    return (
        <NewtabContext.Provider
            value={{
                bookmarkListHeaders,
                setBookmarkListHeaders,
                bookmarkList,
                setBookmarkList,
                frequentlyVisitedWebsites,
                setFrequentlyVisitedWebsites,
                frequentlyVisitedWebsiteContainerWidth,
                setFrequentlyVisitedWebsiteContainerWidth,
                bookmarkNum,
                setBookmarkNum
            }}>
            <ConfigProvider locale={getAntdLocale()}>
                <div
                    className={
                        "flex flex-row h-screen m-0 p-0 box-border scroll-smooth"
                    }>
                    {isSidebarVisible ? (
                        <div
                            className={`w-1/6 ${isMouseInLeftBookmarkFolder ? "overflow-y-auto" : "overflow-y-hidden"}  scrollbar`}
                            onMouseEnter={() => {
                                setMouseInLeftBookmarkFolder(true)
                            }}
                            onMouseLeave={() => {
                                setMouseInLeftBookmarkFolder(false)
                            }}
                            ref={leftPartRef}>
                            <div
                                className={`sticky top-0 z-10 ${isSticky ? "bg-white" : "bg-transparent"} transition-colors duration-300`}>
                                <Select
                                    size={"large"}
                                    defaultValue={DEFAULT_BOOKMARKS_SELECTED_ID}
                                    className={"w-full p-1"}
                                    bordered={true}
                                    onChange={async (value) => {
                                        let menus0 = await constructMenu(
                                            BOOKMARKS_MAPPING.get(value),
                                            []
                                        )
                                        setMenus(menus0)
                                    }}
                                    options={
                                        bookmarks != null
                                            ? bookmarks["children"].map(
                                                  (bookmark) => {
                                                      return {
                                                          value: bookmark["id"],
                                                          label: bookmark[
                                                              "title"
                                                          ]
                                                      }
                                                  }
                                              )
                                            : []
                                    }
                                />
                            </div>
                            <Menu
                                className={"w-full"}
                                mode="inline"
                                items={menus}
                                onClick={({ item, key, keyPath, domEvent }) => {
                                    updateList(key, keyPath)
                                }}
                            />
                        </div>
                    ) : (
                        <></>
                    )}
                    <BookmarkList />
                </div>
                <div
                    className={`fixed bottom-1 left-1 z-10 bg-transparent transition-colors duration-300`}>
                    {isSidebarVisible ? (
                        <MenuFoldOutlined
                            className={COLLAPSE_BUTTON_CLASS}
                            onClick={toggleSidebar}
                        />
                    ) : (
                        <MenuUnfoldOutlined
                            className={COLLAPSE_BUTTON_CLASS}
                            onClick={toggleSidebar}
                        />
                    )}
                </div>
                <FloatButton.Group shape="circle" style={{ right: 24 }}>
                    <FloatButton.BackTop visibilityHeight={400} />
                </FloatButton.Group>
            </ConfigProvider>
        </NewtabContext.Provider>
    )
}

export default NewTab
