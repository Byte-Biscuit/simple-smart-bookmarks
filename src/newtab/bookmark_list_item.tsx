import React, { useContext, useEffect, useState } from "react";
import { List, Avatar, Button, message, Popconfirm, Tooltip, Input, Modal } from "antd";
import dayjs from "dayjs";
import _ from "lodash";
import type { BookmarkInspection, BookmarkTreeNode } from "~util/types";
import {
    getDefaultFaviconFromUrl,
    LocalIcon,
    getCache,
    removeCache,
    bookmarkInspect,
    setCache, hashCode
} from "~util/common";
import classNames from "classnames";
import intl from "react-intl-universal";
import { FormOutlined, DeleteOutlined } from "@ant-design/icons";

const { TextArea } = Input;


const BookmarkItemMeta: React.FC<{ bookmarkInspection?: BookmarkInspection, bookmark: BookmarkTreeNode }> = props => {
    const { bookmarkInspection, bookmark } = props;
    if (bookmarkInspection != null) {
        return (
          <List.Item.Meta
            avatar={<Avatar src={bookmarkInspection.favicon} />}
            title={
                bookmarkInspection.note != null ? (
                  <Tooltip title={bookmarkInspection.note}><a href={bookmark.url}
                                                              target="_blank">{bookmark.title}</a></Tooltip>) : (
                  <a href={bookmark.url} target="_blank">{bookmark.title}</a>)
            }
            description={
                <>
                    {bookmarkInspection.keywords != null ?
                      (<Tooltip title={bookmarkInspection.keywords}><p
                        className={"mt-0.5 mb-0 line-clamp-3"}>{bookmarkInspection.description || bookmark.url}
                      </p></Tooltip>)
                      :
                      (<p
                        className={"mt-0.5 mb-0 line-clamp-3"}>{bookmarkInspection.description || bookmark.url}
                      </p>)
                    }
                    <p className={"mt-0.5 mb-0 text-blue-500"}>
                        {intl.get("bookmark-added-date").d("Update")}:{dayjs(bookmark.dateAdded).format("YYYY-MM-DD")}
                    </p>
                </>
            }
          />
        );
    }
    return (
      <List.Item.Meta
        avatar={<Avatar src={getDefaultFaviconFromUrl(bookmark.url)} />}
        title={<a href={bookmark.url} target="_blank">{bookmark.title}</a>}
        description={
            <>
                <p className={"mt-0.5 mb-0 line-clamp-1"}>{bookmark.url}</p>
                <p className={"mt-0.5 mb-0 text-blue-500"}>
                    {intl.get("bookmark-added-date").d("Update")}:{dayjs(bookmark.dateAdded).format(" YYYY-MM-DD")}
                </p>
            </>
        }
      />
    );
};


/**
 * Bookmark List Item
 * @param props
 * @constructor
 */
const BookmarkItem: React.FC<{
    bookmark: BookmarkTreeNode,
    bookmarkList: BookmarkTreeNode[],
    setBookmarkList: (bookmarkList: BookmarkTreeNode[]) => void
}> = props => {
    const { bookmark, bookmarkList, setBookmarkList } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [bookmarkInspection, setBookmarkInspection] = useState<BookmarkInspection>(null);
    const [noteUpdateModalView, setNoteUpdateModalView] = useState(false);
    const [note, setNote] = useState<string>("");
    useEffect(() => {
        getCache(hashCode(bookmark.url)).then(inspect => {
            if (inspect != null) {
                let bm = inspect as unknown as BookmarkInspection;
                setBookmarkInspection(bm);
                setNote(bm?.note);
            }
        });
    }, []);

    return (
      <>
          {contextHolder}
          <Modal title={intl.get("bookmark-note-update-title").d("Update Bookmark Note")}
                 okText={intl.get("bookmark-note-update-button-ok-text").d("Submit")}
                 cancelText={intl.get("bookmark-note-update-button-cancel-text").d("Cancel")}
                 open={noteUpdateModalView}
                 onOk={() => {
                     let key = hashCode(bookmark.url);
                     if (note != null && note.trim().length !== 0) {
                         let newObject = { ...bookmarkInspection, note };
                         setBookmarkInspection(newObject);
                         setCache(key, newObject).then(() => {
                             setNoteUpdateModalView(false);
                             messageApi.info(intl.get("bookmark-note-update-success").d("Update successfully"));
                         });
                     }
                 }}
                 onCancel={() => {
                     setNoteUpdateModalView(false);
                 }}>
              <TextArea rows={4} defaultValue={note} maxLength={600}
                        onChange={(e) => {
                            setNote(e.target.value);
                        }} />
          </Modal>
          <List.Item
            className={classNames({ "bg-red-100": bookmarkInspection != null && bookmarkInspection.status >= 400 })}
            actions={[
                <Button className={"px-1"}
                        type="link"
                        icon={<FormOutlined />}
                        onClick={() => {
                            setNoteUpdateModalView(true);
                        }}
                >
                    {intl.get("bookmark-add-note-text").d("Note")}
                </Button>,
                <Button className={"px-1"}
                        type="link"
                        icon={<LocalIcon type="icon-gengxin" />}
                        onClick={() => {
                            bookmarkInspect(bookmark.url).then(inspectResult => {
                                let key = hashCode(bookmark.url);
                                getCache(key).then((res) => {
                                    let cacheInspect = res as unknown as BookmarkInspection;
                                    if (res == null) {
                                        setCache(key, inspectResult).then(() => {
                                            setBookmarkInspection(inspectResult);
                                        });
                                        return;
                                    }
                                    inspectResult.note = cacheInspect.note;
                                    setCache(key, inspectResult).then(() => {
                                        setBookmarkInspection(inspectResult);
                                    });
                                });
                            });
                        }}
                >
                    {intl.get("bookmark-inspection-update-text").d("Update")}
                </Button>,
                <Popconfirm
                  title={intl.get("bookmark-remove-popconfirm-title").d("Confirmation of bookmark deletion")}
                  description={intl.get("bookmark-remove-popconfirm-description").d("Are you sure you want to delete this bookmark, you can't restore it after deletion?")}
                  onConfirm={
                      () => {
                          chrome.bookmarks.remove(bookmark.id).then(() => {
                              removeCache(hashCode(bookmark.url)).then(() => {
                                  messageApi.info(intl.get("bookmark-remove-success").d("Deleted successfully"));
                                  setBookmarkList(_.filter(bookmarkList, (value, _index) => {
                                      return value.id !== bookmark.id;
                                  }));
                              });
                          });
                      }}
                  okText="Yes"
                  cancelText="No"
                >
                    <Button className={"px-1"}
                            type="link"
                            icon={<DeleteOutlined />}
                    >
                        {intl.get("bookmark-delete-button-text").d("Delete")}
                    </Button>
                </Popconfirm>
            ]}
          >
              <BookmarkItemMeta bookmark={bookmark} bookmarkInspection={bookmarkInspection} />
          </List.Item>
      </>
    );
};
export default BookmarkItem;