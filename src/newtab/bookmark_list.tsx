import React, {useState, useContext, useEffect,useRef } from "react";
import { List } from "antd";
import type { BookmarkTreeNode } from "~util/types";
import { bookmarkInspect, Constants, getCache, hashCode, NewtabContext, setCache } from "~util/common";
import BookmarkItem from "~newtab/bookmark_list_item";
import BookmarkSublistItem from "~newtab/bookmark_list_sublist_item";
import BookmarkListHeader from "~newtab/bookmark_list_header";
import Header from "~newtab/header";


const BookmarkList: React.FC<{}> = props => {
    const {
        bookmarkList,
        setBookmarkList,
        setBookmarkListHeaders,
        bookmarkListHeaders
    } = useContext(NewtabContext);
    const [isSticky, setIsSticky] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const handleScroll = () => {
        const offset = containerRef.current.scrollTop;
        setIsSticky(offset > 0);
    };

    useEffect(() => {
        const container = containerRef.current;
        container?.addEventListener("scroll", handleScroll);
        return () => {
            container?.removeEventListener("scroll", handleScroll);
        };
    }, []);
    useEffect(() => {
        for (const bookmark0 of bookmarkList) {
            let bookmark = bookmark0 as BookmarkTreeNode;
            if (bookmark.dateGroupModified != null) {
                continue;
            }
            let key = hashCode(bookmark.url);
            getCache(key).then(res => {
                if (res == null) {
                    bookmarkInspect(bookmark.url).then(res => {
                        setCache(key, res);
                    });
                }
            });
        }
    }, [bookmarkList]);

    return (
      <div className={"px-1 grow overflow-y-auto scrollbar"} ref={containerRef}>
           <div className={`sticky top-0 z-10 ${isSticky ? "bg-white" : "bg-transparent"} transition-colors duration-300`} >
                <Header />
           </div>
                <List
                    size="large"
                    header={<BookmarkListHeader />}
                    bordered
                    dataSource={bookmarkList}
                    renderItem={(item: BookmarkTreeNode, _) => (
                    item.dateGroupModified == null ?
                        <BookmarkItem bookmark={item} key={item.id} bookmarkList={bookmarkList}
                                    setBookmarkList={setBookmarkList} />
                        :
                        <BookmarkSublistItem bookmark={item} key={item.id}
                                            bookmarkList={bookmarkList}
                                            setBookmarkList={setBookmarkList}
                                            bookmarkListHeaders={bookmarkListHeaders}
                                            setBookmarkListHeaders={setBookmarkListHeaders} />
                    )}
                />
      </div>
    );
};
export default BookmarkList;