import React, { useContext } from "react"
import { getBookmarkChildren, NewtabContext, Constants } from "~util/common"
import _ from "lodash"
import { Button, Space } from "antd"
import type { BookmarkTreeNode } from "~util/types"
import intl from "react-intl-universal"

const BookmarkListHeader: React.FC<{}> = () => {
    const { bookmarkListHeaders, setBookmarkListHeaders, setBookmarkList } =
        useContext(NewtabContext)
    return (
        <div className={"flex flex-row justify-between items-center h-6"}>
            <Space className={"text-base"}>
                {bookmarkListHeaders.length > 1
                    ? bookmarkListHeaders.map((it, index) =>
                          index === bookmarkListHeaders.length - 1 ? (
                              <span key={it.id}>{it.title}</span>
                          ) : (
                              <>
                                  <Button
                                      className={"px-0"}
                                      type={"link"}
                                      key={it.id}
                                      onClick={() => {
                                          setBookmarkListHeaders(
                                              _.filter(
                                                  bookmarkListHeaders,
                                                  (it, inx) => {
                                                      return inx <= index
                                                  }
                                              )
                                          )
                                          getBookmarkChildren(
                                              it.id,
                                              Constants.SORT_DESC
                                          ).then((res) => setBookmarkList(res))
                                      }}>
                                      {it.title}
                                  </Button>
                                  /
                              </>
                          )
                      )
                    : bookmarkListHeaders.map((it) => (
                          <span key={it.id}>{it.title}</span>
                      ))}
            </Space>
            <Button
                type="link"
                onClick={() => {
                    chrome.bookmarks
                        .getRecent(Constants.DEFAULT_RECENT_BOOKMARK_NUMBER)
                        .then((data) => {
                            setBookmarkList(data as BookmarkTreeNode[])
                            setBookmarkListHeaders([
                                {
                                    id: "-1",
                                    title: intl
                                        .get("recent-bookmarks")
                                        .d("Recent Bookmarks")
                                }
                            ])
                        })
                }}>
                {intl
                    .get("recent-bookmarks-link-text")
                    .d("View recent bookmarks")}
            </Button>
        </div>
    )
}

export default BookmarkListHeader
