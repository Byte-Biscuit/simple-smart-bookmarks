import React, { useContext, useState } from "react"
import {
    Constants,
    getSyncCache,
    hashCode,
    NewtabContext,
    resetFrequentlyVisitedWebsiteLayout,
    setSyncCache,
    websiteInspect
} from "~util/common"
import { Button, Input, Form, message } from "antd"
import type { FrequentlyVisitedWebsite } from "~util/types"
import intl from "react-intl-universal"

export const DEFAULT_SEARCH_ENGINE = Constants.DEFAULT_SEARCH_ENGINES[2]

export const AddWebsite: React.FC<{}> = (props) => {
    const {
        frequentlyVisitedWebsiteContainerWidth,
        setFrequentlyVisitedWebsites
    } = useContext(NewtabContext)
    const [loading, setLoading] = useState<boolean>(false)
    const [messageApi, contextHolder] = message.useMessage()
    const [form] = Form.useForm()
    return (
        <>
            {contextHolder}
            <Form
                name="basic"
                form={form}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                style={{ maxWidth: 600 }}
                initialValues={{ remember: true }}
                onFinish={(values) => {
                    const { name, url } = values
                    getSyncCache(Constants.CACHE_KEY_FREQUENTLY_VISITED_WEBSITE)
                        .then((res) => {
                            setLoading(true)
                            websiteInspect(url)
                                .then((_website) => {
                                    const { url, title, status, favicon } =
                                        _website
                                    let website: FrequentlyVisitedWebsite = {
                                        id: hashCode(url + Date.now()),
                                        name,
                                        url,
                                        favicon,
                                        title,
                                        ranking: 0,
                                        status,
                                        createTime: Date.now()
                                    }
                                    let ext: FrequentlyVisitedWebsite[] =
                                        res as unknown as FrequentlyVisitedWebsite[]
                                    if (ext == null) {
                                        ext = []
                                    }
                                    setSyncCache(
                                        Constants.CACHE_KEY_FREQUENTLY_VISITED_WEBSITE,
                                        [...ext, website]
                                    )
                                        .then(() => {
                                            messageApi.info(
                                                intl
                                                    .get("website-add-success")
                                                    .d("Website add success!")
                                            )
                                            resetFrequentlyVisitedWebsiteLayout(
                                                frequentlyVisitedWebsiteContainerWidth
                                            ).then((res) => {
                                                setFrequentlyVisitedWebsites(
                                                    res
                                                )
                                            })
                                            form.resetFields()
                                        })
                                        .catch((err) => {
                                            console.log(err)
                                        })
                                })
                                .catch(() => {
                                    //
                                })
                        })
                        .finally(() => {
                            setLoading(false)
                        })
                }}
                onFinishFailed={() => {}}
                autoComplete="off">
                <Form.Item
                    label={intl.get("website-add-form-name").d("Name")}
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: intl
                                .get("website-add-form-name-required")
                                .d("Please input website name")
                        }
                    ]}>
                    <Input />
                </Form.Item>

                <Form.Item
                    label={intl.get("website-add-form-url").d("Url")}
                    name="url"
                    rules={[
                        {
                            required: true,
                            message: intl
                                .get("website-add-form-url-required")
                                .d("Please input website url")
                        }
                    ]}>
                    <Input />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {intl.get("website-add-form-submit").d("Submit")}
                    </Button>
                </Form.Item>
            </Form>
        </>
    )
}
export default AddWebsite
