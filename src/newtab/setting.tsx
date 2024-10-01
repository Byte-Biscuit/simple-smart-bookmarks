import React, { useEffect, useState } from "react"
import {
    Constants,
    getSyncCache,
    setSyncCache,
    stringToBoolean
} from "~util/common"
import { Button, Checkbox, List, Modal, Input, Form, message } from "antd"
import type { SearchEngine } from "~util/types"
import classNames from "classnames"
import {
    DeleteOutlined,
    CheckCircleOutlined,
    PlusCircleOutlined
} from "@ant-design/icons"
import intl from "react-intl-universal"

export const DEFAULT_SEARCH_ENGINE = Constants.DEFAULT_SEARCH_ENGINES[2]

export const Setting: React.FC<{}> = (props) => {
    const [engines, setEngines] = useState<SearchEngine[]>([])
    const [visible, setVisible] = useState<boolean>(false)
    const [showSearchBox, setShowSearchBox] = useState<boolean>(true)
    const [messageApi, contextHolder] = message.useMessage()
    useEffect(() => {
        getSyncCache(Constants.CACHE_KEY_SEARCH_ENGINES).then((res) => {
            let _engines = (res || []) as SearchEngine[]
            if (_engines.length == 0) {
                setEngines(Constants.DEFAULT_SEARCH_ENGINES)
            } else {
                setEngines(_engines)
            }
        })
        getSyncCache(Constants.CACHE_KEY_SEARCH_DIALOG_SHOW).then((res) => {
            if (res != null) {
                setShowSearchBox(stringToBoolean(res))
            }
        })
    }, [])

    useEffect(() => {
        setSyncCache(Constants.CACHE_KEY_SEARCH_ENGINES, engines).then(() => {
            engines.forEach((it) =>
                it?.default === "1"
                    ? setSyncCache(
                          Constants.CACHE_KEY_DEFAULT_SEARCH_ENGINE,
                          it
                      )
                    : ""
            )
        })
    }, [engines])

    const actions = (item) => {
        let actions = [
            <Button
                className={"px-1"}
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => {
                    setEngines(engines.filter((it) => item.name !== it.name))
                }}>
                {intl.get("search-engine-delete").d("Delete")}
            </Button>
        ]
        if (item?.default !== "1") {
            actions.push(
                <Button
                    className={"px-1"}
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                        setEngines(
                            engines.map((it) => {
                                it.name === item.name
                                    ? (it.default = "1")
                                    : (it.default = "0")
                                return it
                            })
                        )
                    }}>
                    {intl.get("search-engine-set-as-default").d("Default")}
                </Button>
            )
        }
        return actions
    }

    return (
        <>
            {contextHolder}
            <Modal
                open={visible}
                onCancel={() => {
                    setVisible(false)
                }}
                footer={null}
                title={null}
                closable={false}
                destroyOnClose={true}>
                <Form
                    name="basic"
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    style={{ maxWidth: 600 }}
                    initialValues={{ remember: true }}
                    onFinish={(values) => {
                        const { name, url, asDefault } = values
                        if (asDefault) {
                            setEngines([
                                ...engines.map((it) => {
                                    it.default = "0"
                                    return it
                                }),
                                { name, url, default: "1" }
                            ])
                        } else {
                            setEngines([
                                ...engines,
                                { name, url, default: "0" }
                            ])
                        }
                        messageApi.info(
                            intl
                                .get("search-engine-add-success")
                                .d("Search engine add success!")
                        )
                        setVisible(false)
                    }}
                    onFinishFailed={() => {}}
                    autoComplete="off">
                    <Form.Item
                        label={intl
                            .get("search-engine-add-form-name")
                            .d("Name")}
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: intl
                                    .get("search-engine-add-form-name-required")
                                    .d("Please input engine name")
                            }
                        ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={intl.get("search-engine-add-form-url").d("Url")}
                        name="url"
                        rules={[
                            {
                                required: true,
                                message: intl
                                    .get("search-engine-add-form-url-required")
                                    .d("Please input engine url")
                            }
                        ]}>
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="asDefault"
                        valuePropName="checked"
                        wrapperCol={{ offset: 8, span: 16 }}>
                        <Checkbox>
                            {intl
                                .get("search-engine-add-form-as-default")
                                .d("As Default")}
                        </Checkbox>
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                        <Button type="primary" htmlType="submit">
                            {intl
                                .get("search-engine-add-form-submit")
                                .d("Submit")}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Checkbox
                className={"mb-2"}
                checked={showSearchBox}
                onChange={(event) => {
                    let checked = event.target.checked
                    setShowSearchBox(checked)
                    setSyncCache(
                        Constants.CACHE_KEY_SEARCH_DIALOG_SHOW,
                        checked
                    ).then()
                }}>
                {intl
                    .get("setting-config-startup-show-search")
                    .d("If show the search box when open.")}
            </Checkbox>
            <List
                size={"small"}
                header={
                    <div className={"flex flex-row justify-between"}>
                        <div>
                            {intl
                                .get("search-engine-admin")
                                .d("Setting search engine.")}
                        </div>
                        <div>
                            <Button
                                className={"px-1"}
                                type="link"
                                icon={<PlusCircleOutlined />}
                                onClick={() => {
                                    setVisible(true)
                                }}>
                                {intl.get("search-engine-add-new").d("Add new")}
                            </Button>
                        </div>
                    </div>
                }
                bordered
                dataSource={engines}
                renderItem={(item) => (
                    <List.Item
                        className={classNames({
                            "bg-green-100": item?.default === "1"
                        })}
                        actions={actions(item)}>
                        <List.Item.Meta
                            title={item.name}
                            description={item.url}
                        />
                    </List.Item>
                )}
            />
        </>
    )
}
export default Setting
