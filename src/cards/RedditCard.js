import React, { useContext, useState, useEffect } from 'react'
import { FaReddit } from 'react-icons/fa';
import redditApi from '../services/reddit'
import CardComponent from "../components/CardComponent"
import ListComponent from "../components/ListComponent"
import { format } from 'timeago.js';
import PreferencesContext from '../preferences/PreferencesContext'
import CardLink from "../components/CardLink"
import { BiCommentDetail } from 'react-icons/bi';
import { MdAccessTime } from "react-icons/md"
import { VscTriangleUp } from 'react-icons/vsc';
import { GoPrimitiveDot } from "react-icons/go"
import CardItemWithActions from '../components/CardItemWithActions'
import ColoredLanguagesBadge from "../components/ColoredLanguagesBadge"

const formatResponsePost = (post) => {
    const { data: {
        title, subreddit, link_flair_text, link_flair_background_color,
        score, num_comments, permalink, created_utc
    } } = post
    return { 
        title, subreddit, link_flair_text, link_flair_background_color,
        score, num_comments, permalink, created_utc
    }
}

const PostItem = ({ item, index, analyticsTag }) => {
    const fullUrl = `https://www.reddit.com${item.permalink}`

    return (
        <CardItemWithActions
            source={'reddit'}
            index={index}
            key={index}
            item={{...item, url: fullUrl}}
            cardItem={(
                <>
                    <p className="rowTitle">
                        <CardLink link={fullUrl} analyticsSource={analyticsTag}>
                            <VscTriangleUp className={"rowTitleIcon"} />
                            {item.title}
                        </CardLink>
                    </p>
                    <div className="rowDetails">
                        <span className="rowItem hnRowItem" ><GoPrimitiveDot className="rowItemIcon" /> {item.score} points</span>
                        <span className="rowItem">
                            <MdAccessTime className="rowItemIcon" /> {format(new Date(item.created_utc * 1000))}
                        </span>
                        <span className="rowItem"><BiCommentDetail className="rowItemIcon" /> {item.num_comments} comments</span>
                    </div>
                </>
            )}
        />
    )
}



function RedditCard({ analyticsTag, label }) {
    const preferences = useContext(PreferencesContext)
    const { userSelectedTags } = preferences

    const [refresh, setRefresh] = useState(true)

    useEffect(() => {
        setRefresh(!refresh)
    }, [userSelectedTags])

    const fetchPosts = async () => {
        const promises = userSelectedTags.map(tag => {
            if (tag.redditValues) {
                return redditApi.getTopPostsBySubReddit(tag.redditValues[0])
            }
            return []
        })

        const results = await Promise.allSettled(promises)
        return results.map(res => {
            let value = res.value
            if (res.status === 'rejected') {
                value = []
            }
            return value.map(item => formatResponsePost(item))
        }).flat().sort((a, b) => b.score - a.score).slice(0, 40)
    }

    const renderPosts = (articles) => {
        return articles.map((item, index) => (
            <PostItem item={item} key={`at-${index}`} index={index} analyticsTag={analyticsTag} />
        ))
    }

    return (

        <CardComponent
            icon={<FaReddit className="blockHeaderIcon blockHeaderWhite" />}
            title={label}
        >
            <ListComponent
                fetchData={fetchPosts}
                renderData={renderPosts}
                refresh={refresh}
            />
        </CardComponent>
    )
}

export default RedditCard