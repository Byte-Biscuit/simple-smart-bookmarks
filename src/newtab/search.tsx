import React, { useEffect, useState, useRef, type KeyboardEvent } from "react"
import { Input, List, Space, Checkbox, Select, DatePicker } from "antd"
import intl from "react-intl-universal"
import {
    LocalIcon,
    bookmarkSearch,
    Constants,
    getSyncCache
} from "~util/common"
import type { BookmarkTreeNode, SearchEngine } from "~util/types"
import BookmarkItem from "~newtab/bookmark_list_item"
import BookmarkSublistItem from "~newtab/bookmark_list_sublist_item"
import { DEFAULT_SEARCH_ENGINE } from "~newtab/setting"

//Define the property object of search engines use tricks
interface TrickObject {
    // Specify website
    site?: string
    // Specify exact match text content
    exactMatch?: string
    // Specify file type
    fileType?: string
    // Specify the search time range start
    timeRangeStart?: string
    // Specify the search time range end
    timeRangeEnd?: string
}

const { RangePicker } = DatePicker

// Common file type for search engine tricks
const COMMON_FILETYPES: string[] = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "txt",
    "rtf",
    "xml",
    "html",
    "htm",
    "css",
    "js",
    "json",
    "csv",
    "tsv",
    "mp3",
    "wav",
    "mp4",
    "avi",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg"
]

const Search: React.FC<{}> = (props) => {
    const [trick, setTrick] = useState<TrickObject>({})
    const [keyword, setKeyword] = useState<string>("")
    const [useSearchTick, setSearchTick] = useState<boolean>(false)
    const searchInputRef = useRef(null)
    const [bookmarkList, setBookmarkList] = useState<BookmarkTreeNode[]>([])
    const [pageIndex, setPageIndex] = useState<number>(1)

    useEffect(() => {
        searchInputRef.current.focus()
    }, [])

    useEffect(() => {
        if (keyword === "" || keyword.trim().length == 0) {
            return
        }
        const searching = setTimeout(() => {
            bookmarkSearch(keyword).then((res) => {
                setBookmarkList(res as BookmarkTreeNode[])
                setPageIndex(1)
            })
        }, 1200)
        return () => clearTimeout(searching)
    }, [keyword])

    // Search
    const search = (event: KeyboardEvent<HTMLInputElement>) => {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.code.toUpperCase() === "ENTER"
        ) {
            let searchWord = (event.target as HTMLInputElement).value
            if (searchWord === "" || searchWord.trim().length == 0) {
                return
            }
            event.preventDefault()
            let searchUrl = DEFAULT_SEARCH_ENGINE.url
            getSyncCache(Constants.CACHE_KEY_DEFAULT_SEARCH_ENGINE)
                .then((res) => {
                    if (res != null) {
                        let engine = res as unknown as SearchEngine
                        searchUrl = engine.url
                    }
                    if (useSearchTick) {
                        let searchTrick = trick
                        if (searchTrick.site) {
                            searchWord += `+site%3A${searchTrick.site}`
                        }
                        if (searchTrick.exactMatch) {
                            searchWord += `+"${searchTrick.exactMatch}"`
                        }
                        if (searchTrick.fileType) {
                            searchWord += `+filetype%3A${searchTrick.fileType}`
                        }
                    }
                    window.open(searchUrl + searchWord)
                })
                .catch((_) => {
                    window.open(searchUrl + searchWord)
                })
        }
    }

    return (
        <>
            <div className={"flex flex-col"}>
                <div className={"flex flex-row p-1"}>
                    <Space>
                        <Checkbox
                            defaultChecked={useSearchTick}
                            onChange={(event) => {
                                setSearchTick(event.target.checked)
                            }}>
                            {intl
                                .get("search.engine.trick.use-trick")
                                .d("Enable advanced search")}
                        </Checkbox>
                        {useSearchTick ? (
                            <>
                                <label htmlFor={"fileType"}>
                                    {intl
                                        .get("search.engine.trick.file-type")
                                        .d("FileType")}
                                </label>
                                <Select
                                    id={"fileType"}
                                    className={"w-44"}
                                    allowClear={true}
                                    showSearch={true}
                                    optionFilterProp={"children"}
                                    placeholder={intl
                                        .get(
                                            "search.engine.trick.file-type-placeholder"
                                        )
                                        .d("Please select the file type")}
                                    onChange={(value, option) => {
                                        setTrick({
                                            ...trick,
                                            fileType: value
                                        })
                                    }}>
                                    {COMMON_FILETYPES.map((item) => {
                                        return (
                                            <Select.Option value={item}>
                                                {item}
                                            </Select.Option>
                                        )
                                    })}
                                </Select>
                                <label htmlFor={"webSite"}>
                                    {intl
                                        .get("search.engine.trick.website")
                                        .d("Website")}
                                </label>
                                <Input
                                    id={"webSite"}
                                    placeholder={intl
                                        .get(
                                            "search.engine.trick.website-placeholder"
                                        )
                                        .d("Please specify website")}
                                    onChange={(event) =>
                                        setTrick({
                                            ...trick,
                                            site: event.target.value
                                        })
                                    }></Input>
                                <label htmlFor={"exactMatch"}>
                                    {intl
                                        .get("search.engine.trick.exact-match")
                                        .d("ExactMatch")}
                                </label>
                                <Input
                                    id={"exactMatch"}
                                    placeholder={intl
                                        .get(
                                            "search.engine.trick.exact-match-placeholder"
                                        )
                                        .d("Please specify exact match words")}
                                    onChange={(event) =>
                                        setTrick({
                                            ...trick,
                                            exactMatch: event.target.value
                                        })
                                    }></Input>
                            </>
                        ) : (
                            <>
                                <span className={"text-gray-400 text-sm"}>
                                    {intl
                                        .get(
                                            "search.engine.trick.use-trick-note"
                                        )
                                        .d(
                                            "This function only works when using the search engine"
                                        )}
                                </span>
                            </>
                        )}
                    </Space>
                </div>
                <div className={"flex flex-row items-center w-full mb-1.5 "}>
                    <Input
                        ref={searchInputRef}
                        rootClassName={"grow mr-2 h-11"}
                        prefix={<LocalIcon type="icon-search" />}
                        suffix={
                            <>
                                <span className={"font-semibold"}>
                                    {intl
                                        .get("enter-to-search-the-internet")
                                        .d(
                                            "Ctrl+Enter to search the internet/Esc hide"
                                        )}
                                </span>
                            </>
                        }
                        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) =>
                            search(event)
                        }
                        onChange={(event) => {
                            setKeyword(event.target.value)
                        }}
                    />
                </div>
                <List
                    size="default"
                    bordered
                    dataSource={bookmarkList}
                    renderItem={(item: BookmarkTreeNode, _) =>
                        item.dateGroupModified == null ? (
                            <BookmarkItem
                                bookmark={item}
                                key={item.id}
                                bookmarkList={bookmarkList}
                                setBookmarkList={setBookmarkList}
                            />
                        ) : (
                            <BookmarkSublistItem
                                bookmark={item}
                                key={item.id}
                                bookmarkList={bookmarkList}
                                setBookmarkList={setBookmarkList}
                            />
                        )
                    }
                    pagination={{
                        position: "bottom",
                        align: "end",
                        pageSize: 6,
                        total: bookmarkList.length,
                        hideOnSinglePage: true,
                        defaultCurrent: 1,
                        current: pageIndex,
                        onChange: (pageIndex, _) => {
                            setPageIndex(pageIndex)
                        }
                    }}
                />
            </div>
        </>
    )
}

export default Search
