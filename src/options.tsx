import intl from "react-intl-universal"
import "./tailwind.css"
import { i18n } from "~locales"
import { useEffect } from "react"

function IndexOption() {
    useEffect(() => {
        i18n().then((_) => {})
    }, [])
    return (
        <div className={"flex flex-col p-10"}>
            <h1>
                {intl
                    .get("options-welcome-title")
                    .d("Welcome to Simple Smart Bookmark Manager")}
            </h1>
            <div>
                {intl.get("options-welcome-content").d("Hope you enjoy it!")}
            </div>
        </div>
    )
}

export default IndexOption
