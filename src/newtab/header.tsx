import React, {
    useEffect,
    useRef,
    useState,
    useLayoutEffect,
    useContext
} from "react"
import intl from "react-intl-universal"
import { Space, Input, Button, Modal, Avatar, message, Drawer } from "antd"
import {
    clearCache,
    clearSyncCache,
    Constants,
    getSyncCache,
    LocalIcon,
    NewtabContext,
    resetFrequentlyVisitedWebsiteLayout,
    setSyncCache,
    stringToBoolean,
    updateFrequentlyVisitedWebsiteRanking
} from "~util/common"
import type { FrequentlyVisitedWebsite } from "~util/types"
import {
    PlusCircleOutlined,
    CloseCircleOutlined,
    ClearOutlined,
    UnorderedListOutlined
} from "@ant-design/icons"
import Search from "~newtab/search"
import Setting from "~newtab/setting"
import AddWebsite from "~newtab/add_website"
import classNames from "classnames"

const ELEMENT_WIDTH =
    Constants.FREQUENTLY_VISITED_WEBSITE_CONTAINER.elementWidth
const ELEMENT_HEIGHT =
    Constants.FREQUENTLY_VISITED_WEBSITE_CONTAINER.elementHeight
const ELEMENT_MARGIN_X =
    Constants.FREQUENTLY_VISITED_WEBSITE_CONTAINER.elementMarginX

/**
 * One website component
 * @param props
 * @constructor
 */
const Website: React.FC<{ item: FrequentlyVisitedWebsite }> = (props) => {
    const { item } = props
    const {
        frequentlyVisitedWebsites,
        setFrequentlyVisitedWebsites,
        frequentlyVisitedWebsiteContainerWidth
    } = useContext(NewtabContext)

    return (
        <div
            style={{
                margin: `0 ${ELEMENT_MARGIN_X}px`,
                width: ELEMENT_WIDTH,
                height: ELEMENT_HEIGHT
            }}
            className={"rounded-lg bg-white shadow hover:shadow-xl"}>
            <CloseCircleOutlined
                title={intl.get("frequently-remove").d("Delete")}
                className={
                    "relative cursor-pointer text-slate-500 hover:text-red-600"
                }
                style={{
                    left: `${ELEMENT_WIDTH - ELEMENT_MARGIN_X}px`,
                    top: "-5px"
                }}
                onClick={() => {
                    let _websites0 = {
                        first: frequentlyVisitedWebsites.first.filter(
                            (it) => it.id != item.id
                        ),
                        other: frequentlyVisitedWebsites.other.filter(
                            (it) => it.id != item.id
                        )
                    }
                    setSyncCache(
                        Constants.CACHE_KEY_FREQUENTLY_VISITED_WEBSITE,
                        [..._websites0.first, ..._websites0.other]
                    ).then(() => {
                        resetFrequentlyVisitedWebsiteLayout(
                            frequentlyVisitedWebsiteContainerWidth
                        ).then((res) => {
                            setFrequentlyVisitedWebsites(res)
                        })
                    })
                }}
            />
            <div
                className={
                    "box-border flex flex-col justify-center items-center cursor-pointer"
                }
                onClick={() => {
                    updateFrequentlyVisitedWebsiteRanking(item.id).then((_) => {
                        window.open(item.url, "_blank")
                        resetFrequentlyVisitedWebsiteLayout(
                            frequentlyVisitedWebsiteContainerWidth
                        ).then((res) => {
                            setFrequentlyVisitedWebsites(res)
                        })
                    })
                }}>
                <Avatar
                    src={
                        <img
                            src={item.favicon}
                            alt={item.title}
                            title={item.title}
                        />
                    }
                />
                <div
                    className={"text-base text-slate-600 line-clamp-2"}
                    title={item.title}>
                    {item.name}
                </div>
            </div>
        </div>
    )
}

/**
 * More frequently visited website show component
 * @param props
 * @constructor
 */
const FrequentlyVisitedWebsiteMore: React.FC<{
    other: FrequentlyVisitedWebsite[]
    visible: boolean
    onClose: () => void
}> = (props) => {
    const { other, visible, onClose } = props
    return (
        <Drawer
            title={intl.get("show-more-frequently-website-title").d("More")}
            placement="right"
            onClose={onClose}
            open={visible}
            bodyStyle={{ padding: "1px" }}>
            <div
                className={
                    "box-border flex flex-row flex-wrap content-start justify-start bg-slate-100 p-1 h-full gap-4"
                }>
                {other?.map((it) => <Website item={it} key={it.id} />)}
            </div>
        </Drawer>
    )
}

export const Header: React.FC<{}> = (props) => {
    const {
        frequentlyVisitedWebsites,
        setFrequentlyVisitedWebsites,
        frequentlyVisitedWebsiteContainerWidth,
        setFrequentlyVisitedWebsiteContainerWidth,
        bookmarkNum
    } = useContext(NewtabContext)
    const [searchBoxVisible, setSearchBoxVisible] = useState<boolean>(false)
    const [settingVisible, setSettingVisible] = useState<boolean>(false)
    const [
        moreFrequentlyVisitedWebsiteVisible,
        setMoreFrequentlyVisitedWebsiteVisible
    ] = useState<boolean>(false)
    const [addWebsiteVisible, setAddWebsiteVisible] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage()
    const containerRef = useRef(null)

    const searchKeyPress = (event) => {
        // KeyK
        if (
            (event.ctrlKey || event.metaKey) &&
            "KEYK" == event.code.toUpperCase()
        ) {
            setSearchBoxVisible(true)
            event.preventDefault()
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", searchKeyPress)
        return () => {
            document.removeEventListener("keydown", searchKeyPress)
        }
    }, [])

    useEffect(() => {
        getSyncCache(Constants.CACHE_KEY_SEARCH_DIALOG_SHOW).then((res) => {
            if (res != null) {
                setSearchBoxVisible(stringToBoolean(res))
            }
        })
    }, [])

    useLayoutEffect(() => {
        let width = containerRef.current.offsetWidth
        setFrequentlyVisitedWebsiteContainerWidth(width)
        resetFrequentlyVisitedWebsiteLayout(width).then((res) => {
            setFrequentlyVisitedWebsites(res)
        })
    }, [])

    return (
        <div className={"box-border flex flex-col items-start w-full p-1"}>
            {contextHolder}
            <Modal
                open={searchBoxVisible}
                onCancel={() => {
                    setSearchBoxVisible(false)
                }}
                footer={null}
                title={null}
                width={"75%"}
                closable={false}
                style={{ top: 20 }}
                destroyOnClose={true}>
                <Search />
            </Modal>
            <Modal
                open={settingVisible}
                onCancel={() => {
                    setSettingVisible(false)
                }}
                width={"50%"}
                footer={null}
                title={intl.get("setting-title").d("Setting")}>
                <Setting />
            </Modal>
            <Modal
                open={addWebsiteVisible}
                onCancel={() => {
                    setAddWebsiteVisible(false)
                }}
                width={"40%"}
                footer={null}
                title={intl.get("add-website-title").d("Add website")}>
                <AddWebsite />
            </Modal>

            <div
                className={
                    "flex flex-row flex-nowrap justify-between items-center w-full"
                }>
                <Space align="center" size={16}>
                    <span className={"text-base"}>
                        {intl
                            .get("frequently-visited-website-title")
                            .d("Frequently Visited Websites")}
                    </span>
                    <Button
                        type="link"
                        icon={<PlusCircleOutlined />}
                        onClick={() => {
                            setAddWebsiteVisible(true)
                        }}>
                        {intl.get("add-website-title").d("Add website")}
                    </Button>
                    <Button
                        type="link"
                        icon={<LocalIcon type="icon-setting" />}
                        onClick={() => {
                            setSettingVisible(true)
                        }}>
                        {intl.get("setting-title").d("Setting")}
                    </Button>
                    <Button
                        type="link"
                        icon={<ClearOutlined />}
                        onClick={() => {
                            clearSyncCache().then((_) => {
                                // messageApi.info(intl.get("clear-cache-success").d("Clear cache success!"));
                            })
                            clearCache().then((_) => {
                                messageApi.info(
                                    intl
                                        .get("clear-cache-success")
                                        .d("Clear cache success!")
                                )
                                resetFrequentlyVisitedWebsiteLayout(
                                    frequentlyVisitedWebsiteContainerWidth
                                ).then((res) => {
                                    setFrequentlyVisitedWebsites(res)
                                })
                            })
                        }}>
                        {intl.get("clear-cache-title").d("Clear Cache")}
                    </Button>
                    <Button type="link" icon={<UnorderedListOutlined />}>
                        {intl.get("bookmark.number").d("No. of bookmarks")}:
                        <span className="text-red-600 px-1 font-medium">
                            {bookmarkNum}
                        </span>
                    </Button>
                </Space>
                <div className={"flex flex-row"}>
                    {frequentlyVisitedWebsites?.other?.length != 0 ? (
                        <Button
                            type="link"
                            icon={
                                moreFrequentlyVisitedWebsiteVisible ? (
                                    <LocalIcon type="icon-zhedie2" />
                                ) : (
                                    <LocalIcon type="icon-zhedie1" />
                                )
                            }
                            onClick={() => {
                                setMoreFrequentlyVisitedWebsiteVisible(true)
                            }}>
                            {intl
                                .get("show-more-frequently-website-title")
                                .d("More")}
                        </Button>
                    ) : (
                        <></>
                    )}
                    <Input
                        rootClassName={"text-slate-400 bg-slate-100"}
                        placeholder={intl
                            .get("search-input-placeholder")
                            .d("Try Ctrl+K for searching")}
                        prefix={<LocalIcon type="icon-search" />}
                        suffix={
                            <>
                                <span className={"font-semibold"}>Ctrl K</span>
                            </>
                        }
                        onClick={() => {
                            setSearchBoxVisible(true)
                        }}
                    />
                </div>
            </div>
            <div
                ref={containerRef}
                className={classNames(
                    "box-border flex flex-row flex-nowrap items-center justify-start w-full bg-slate-100 rounded-md",
                    { "p-2 mt-1": frequentlyVisitedWebsites.first.length != 0 }
                )}>
                {frequentlyVisitedWebsites?.first?.map((it) => (
                    <Website item={it} key={it.id} />
                ))}
            </div>
            {frequentlyVisitedWebsites?.other?.length != 0 ? (
                <FrequentlyVisitedWebsiteMore
                    other={frequentlyVisitedWebsites?.other}
                    visible={moreFrequentlyVisitedWebsiteVisible}
                    onClose={() => {
                        setMoreFrequentlyVisitedWebsiteVisible(false)
                    }}
                />
            ) : (
                <></>
            )}
        </div>
    )
}

export default Header
