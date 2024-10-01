import React, { useContext } from "react";
import { List, Button, Popconfirm, message, Avatar } from "antd";
import dayjs from "dayjs";
import {
    LocalIcon, getBookmarkChildren, Constants
} from "~util/common";
import intl from "react-intl-universal";
import { DeleteOutlined } from "@ant-design/icons";
import _ from "lodash";
import type { BookmarkListHeader, BookmarkTreeNode } from "~util/types";


/**
 * Bookmark List Item
 * @param props
 * @constructor
 */
const BookmarkSublistItem: React.FC<{
    bookmark: BookmarkTreeNode,
    bookmarkList: BookmarkTreeNode[],
    setBookmarkList: (bookmarkList: BookmarkTreeNode[]) => void,
    bookmarkListHeaders?: BookmarkListHeader[],
    setBookmarkListHeaders?: (headers: BookmarkListHeader[]) => void,
}> = props => {
    const {
        bookmark, bookmarkList, setBookmarkList, setBookmarkListHeaders,
        bookmarkListHeaders
    } = props;
    const [messageApi, contextHolder] = message.useMessage();
    return (
      <>
          {contextHolder}
          <List.Item
            actions={[
                <Popconfirm
                  title={intl.get("bookmark-remove-popconfirm-title").d("Confirmation of bookmark deletion")}
                  description={intl.get("bookmark-remove-popconfirm-description").d("Are you sure you want to delete this bookmark, you can't restore it after deletion?")}
                  onConfirm={
                      () => {
                          chrome.bookmarks.remove(bookmark.id).then(() => {
                              messageApi.info(intl.get("bookmark-remove-success").d("Deleted successfully"));
                              setBookmarkList(_.filter(bookmarkList, (value, _index) => {
                                  return value.id !== bookmark.id;
                              }));
                          }).catch(err => {
                              // newtab.html:1 Uncaught (in promise) Error: Can't remove non-empty folder (use recursive to force).
                              messageApi.error(intl.get("bookmark-remove-fail").d("Delete failed, please check if the folder is empty"));
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
              {
                  (
                    <List.Item.Meta
                      avatar={<Avatar src={<LocalIcon type={"icon-anyinmulu"} />} />}
                      title={
                          <a onClick={(event) => {
                              event.preventDefault();
                              if (setBookmarkListHeaders != null) {
                                  setBookmarkListHeaders([...bookmarkListHeaders, {
                                      title: bookmark.title,
                                      id: bookmark.id
                                  }]);
                              }
                              getBookmarkChildren(bookmark.id, Constants.SORT_DESC).then(res => {
                                  setBookmarkList(res);
                              });
                          }
                          }>{bookmark.title}</a>
                      }
                      description={
                          <>
                              <p className={"mt-0.5 mb-0 text-blue-500"}>
                                  {intl.get("bookmark-added-date").d("Update")}:{dayjs(bookmark.dateAdded).format("YYYY-MM-DD")}
                              </p>
                          </>
                      }
                    />
                  )
              }
          </List.Item>
      </>
    );
};
export default BookmarkSublistItem;