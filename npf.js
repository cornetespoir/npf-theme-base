// formats text blocks   
function createText(content) {
     let str =  content.text.replaceAll('<', '&lt;')
    let texts = str.replaceAll('>', '&gt;')
    if (content.text === '') return ''
    let output = ""
    // if there is formatted content
    if (content.formatting) {
        let characters = Array.from(texts.split(''))
        for (const [i, text] of characters.entries()) {
            const char = texts[i]
            // look for end of format
            const endFormatTypes = content.formatting.filter((f) => f.end === i);
            // for each type, create a closing tag
            for (const f of endFormatTypes) {
                if (f.type === "link") {
                    output += "</a>"
                }
                if (f.type === "color") {
                    output += "</span>"
                }
                if (f.type === "bold") {
                    output += "</b>"
                }
                if (f.type === "small") {
                    output += "</span>"
                }
                if (f.type === "mention") {
                    output += "</a>"
                }
                if (f.type === "italic") {
                    output += "</i>"
                }
            }
            // look for start of format
            const startFormatTypes = content.formatting.filter((f) => f.start === i);
            // for each type, create an opening tag 
            for (const f of startFormatTypes) {
                if (f.type === "link") {
                    output += `<a href="${f.url}">`
                }
                if (f.type === "color") {
                    output += `<span style="color:${f.hex}">`
                }
                if (f.type === "bold") {
                    output += `<b>`
                }
                if (f.type === "small") {
                    output += `<span style="font-size:.8rem">`
                }
                if (f.type === "mention") {
                    output += `<a className="mention" href="${f.blog.url}">`;
                }
                if (f.type === "italic") {
                    output += `<i>`
                }
            }
            output += char
        }
    }
    // if no formatting, just output the text 
    else {
        output += texts
    }
    // might scrap this part
    if (content.subtype === "unordered-list-item") {
        let li = document.createElement('li')
        li.classList.add(content.subtype)
        li.innerHTML = output
        return li
    }
    // create an element to put the formatted text in, and then return it  
    else {
        let p = document.createElement('p')
        p.classList.add(content.subtype)
        p.innerHTML = output
        return p
    }
}

// create audio posts 
function createAudio(content) {
    let audioWrapper = document.createElement('div')
    audioWrapper.classList.add('audio-wrapper')
    let audioPost = document.createElement('div')
    audioPost.classList.add('audio-container')
    audioWrapper.innerHTML = content.embed_html
    return audioWrapper
}

// create polls
function createPoll(content, permalink) {
    let id = permalink.substring(permalink.lastIndexOf("/") + 1);
    let poll = document.createElement('div')
    poll.classList.add('poll')
    poll.append(content.question)
    content.answers.map((answers) => {
        let answer = document.createElement('a')
        answer.classList.add('poll-option')
        answer.target = "_blank"
        answer.href = `https://tumblr.com/${ user }/${ id }`
        answer.innerHTML = answers.answer_text
        poll.append(answer)
    })
    return poll
}

// create links
function createLink(content) {
    let link = document.createElement('a')
    link.classList.add('post-link')
    link.href = content.url
    let poster = content.poster 
    let posterImage = document.createElement('div')
    posterImage.classList.add('poster-content')
    if (poster) {
        posterImage.classList.add('poster-with-image')
        posterImage.style.backgroundImage = `url(${content.poster[0].url})`
        posterImage.innerHTML = `<span class="link-title">${content.title}`
    } else {
        posterImage.innerHTML = `<b>${content.title}</b>`
    }
    link.append(posterImage)
    if (content.description) {
        let description = document.createElement('span')
        description.textContent = content.description
        link.append(description)
    }
    let source = document.createElement('span')
    source.classList.add('link-source')
    source.innerHTML = `${content.site_name != null ? content.site_name : ''} | ${content.author != null ? content.author : ''}`

    if (content.author && content.site_name) link.append(source)
    return link
}

// create images (with lightbox support 

function createImage(media) {
     let image = document.createElement('img')
     let anchor = document.createElement('a')
     image.src = media.url
     anchor.classList.add('post_media_photo_anchor')
     anchor.setAttribute('data-big-photo', media.url)
     anchor.setAttribute('data-big-photo-height', media.height)
     anchor.setAttribute('data-big-photo-width', media.width)
     image.setAttribute('srcset', media.url)
     image.classList.add('post_media_photo', 'image')
     anchor.append(image)
     return anchor
}

// create content insie of each row  
function createRow(content, permalink) {
    // sort through content types      
    switch (content.type) {
        case 'text':
            let textWrapper = document.createElement('div')
            textWrapper.classList.add('text-content')
            textWrapper.append(createText(content))
            return textWrapper
            break;

        case 'image':
            return createImage(content.media[0])
            break;

        case 'audio':
            return createAudio(content)
            break;

        case 'link':
            return createLink(content)
            break;

        case 'video':
            if (content.provider === 'tumblr') {
                let video = document.createElement('video')
                video.src = content.url
                video.controls = true
                return video

            } else {
                let video = document.createElement('iframe')
                video.classList.add('video-iframe')
                video.src = content.embed_iframe.url
                video.style.aspectRatio = `${content.embed_iframe.width} / ${content.embed_iframe.height}`
                return video
            }
            break;

        case 'poll':
            return createPoll(content, permalink)
            break;

        // in case there are new post types/types that were missed
        default:
            return `this ${content.type} npf block is not supported yet`
    }
}

// create each row  
function createRows(id, content, layout, permalink, trail = null) {
    let rows = document.createElement('div')
    rows.classList.add('content')
    // if there are indexes with asks 
    let asks = []
    // if there are layouts
    if (layout.length) {
        // if there are rows
        let hasRows = layout.every(v => v.type === 'rows');
        layout.map((layout) => {
            if (hasRows) {
                // if there are displays 
                if (layout.display) {
                    // create individual rows
                    layout.display.map((display) => {
                        let row = document.createElement('div')
                        row.classList.add(`flex`, `content-rows`, `row-size-${display.blocks.length}`)

                        // if there is inner content in a row 
                        if (display.blocks) {
                            display.blocks.map((block) => {
                                let innerRow = document.createElement('div')
                                innerRow.append(createRow(content[block], permalink))
                                row.append(innerRow)
                                rows.append(row)
                            })
                        }

                    })
                }

            }
            // if there are no rows
            else {
                // if layout is an ask
                if (layout.type === 'ask') {
                    let ask = document.createElement('div')
                    ask.classList.add('question')
                    let asker = document.createElement('a')
                    let askerIcon = document.createElement('img')
                    asker.classList.add('asker')
                    if (layout.attribution) {
                        asker.innerHTML = `${layout.attribution.blog.name} asked`
                        askerIcon.src = `https://api.tumblr.com/v2/blog/${layout.attribution.blog.name}/avatar/64`
                    } else {
                        askerIcon.src = "https://assets.tumblr.com/pop/src/assets/images/avatar/anonymous_avatar_96-223fabe0.png"
                        asker.innerHTML = `<span>anonymous asked</span>`
                    }
                    rows.append(askerIcon)
                    ask.append(asker)
                    rows.classList.add('ask')
                    asks = layout.blocks
                    if (layout.blocks) {
                        layout.blocks.map((block) => {
                            ask.append(createRow(content[block], permalink))
                            rows.append(ask)
                        })
                    }
                }
            // if it is a reply
                if (!layout.display) {
                    // create styling for replies
                      let answer = document.createElement('div')
                            answer.classList.add('question', 'answer')
                            let asker = document.createElement('a')
                            asker.classList.add('asker')
                            let askerIcon = document.createElement('img')
                    // if answerer has a valid url
                    if (trail) {
                        asker.innerHTML = `${trail.name} answered`
                        askerIcon.src = `https://api.tumblr.com/v2/blog/${trail.name}/avatar/64`
                        answer.append(asker)
                    }  else asker.innerHTML = 'original reply'
                    
                    content.map((block, index) => {
                    // if block is not part of the original ask
                        if (asks.indexOf(index) === -1) {
                        // if the reply is part of a trail
                          if (trail) {
                            answer.append(createRow(block,permalink))
                            
                            rows.append(askerIcon, answer)   
                          }
                         // if reply is part of an original post 
                          else {
                              rows.append(createRow(block, permalink))
                          }
                        }
                    })
                }
            }
        })

    } else {
        content.map((block) => {
            rows.append(createRow(block, permalink))
        })
    }
    return rows
}

function postNotes(url) {
    let postNotesData = ""
    let postNotesDiv = document.createElement('div')
    let httpRequest = new XMLHttpRequest()
    httpRequest.onreadystatechange = function (data) {
        postNotesData = data.srcElement.response
    }
    httpRequest.open("GET", url)
    httpRequest.send()
    postNotesDiv.innerHTML = postNotesData
    return postNotesDiv
}

function createHeader(blogName, blogURL, active, tumblrmart_accessories) {
    // create reblog header link and avatar img
    let reblogHeader = document.createElement('a')
    reblogHeader.href = blogURL
    let userAvatar = `<img class="user-avatar" src="https://api.tumblr.com/v2/blog/${ blogName }/avatar/64">`
    // will only show the image if a user is active
    reblogHeader.innerHTML = `${active ? userAvatar : ''} <span class="active-${ active } usernames">${ blogName }</span>`
    // determine if there are checkmarks
    let checkmarks = tumblrmart_accessories?.blue_checkmark_count
    if (checkmarks) {
        let checks = ''
        let checkmarkContainer = document.createElement('span')
        checkmarkContainer.classList.add('checkmarks')
        // checkmarks are 2 per purchase
        let total = checkmarks * 2
        // loop through each purchased checkmark + double it
        for (var i = 0; i < checkmarks * 2; i++) {
            // there are 12 official colors, if it is within the first 12, just use the index 
            if (i <= 11) {
                checks += `<span class="checkmark" style="left: calc( 0% + 80% * (${i + 1}/${ total })) "><img src="https://assets.tumblr.com/images/tumblrmart/badges/rainbow/${[ i + 1 ]}.png"></span>`
            }
            // if it's not, we do a little math
            else {
                // math is not my strength i apologize in advance
                let math = (i + 1) - ((Math.ceil((i + 1) / 12) - 1) * 12)
                checks += `<span class="checkmark" style="left: calc( 0% + 80%* (${i + 1}/${ total })) "><img src="https://assets.tumblr.com/images/tumblrmart/badges/rainbow/${ math }.png" ></span>`
            }
        }
        // add the checkmarks to the reblog header
        checkmarkContainer.innerHTML = checks
        // if there's more than 12, add some styling to prevent them from overflowing
        if (total > 12) {
            reblogHeader.classList.add('big-checkmarks')
        }
        reblogHeader.append(checkmarkContainer)
    }
    // return reblog header content
    return reblogHeader
}

// loop through each post in the array
for (const post of posts) {
    let npf = post.npf
    let permalink = post.permalink
    let article = document.createElement('article')
    article.id = `post-${ post.id }`
    // if there is a reblog trail 
    if (npf.trail) {
        npf.trail.map((trail, index) => {
            // create header and content 
            let trailed = document.createElement('div')
            let header = document.createElement('div')
            if (index === 0) {
                header.classList.add('original-poster')
            }
            header.classList.add('reblog-header')
            if (trail.blog) {
                header.append(createHeader(trail.blog.name, trail.blog.url, trail.blog.can_be_followed, trail.blog.tumblrmart_accessories))
            } else {
                let brokenBlog = document.createElement('span')
                brokenBlog.classList.add('broken-blog', 'usernames')
                brokenBlog.innerHTML = trail.broken_blog_name
                header.append(brokenBlog)
            }
            trailed.append(createRows(post.id, trail.content, trail.layout, permalink, trail.blog))
            // add header and trail to the post element
            article.append(header, trailed)
        })
    }
    // if it is an original post  
    if (npf.content.length > 0) {
        let content = document.createElement('div')
        let header = document.createElement('div')
        header.classList.add('reblog-header', 'original-poster')
        header.append(createHeader(user, `https://${ user }.tumblr.com`, true, null))
        content.append(createRows(post.id, npf.content, npf.layout, permalink))
        article.append(header, content)
    }
    // post info 
    let postInfo = document.createElement('div')
    // tags
    if (post.tags) {
         let tagged = document.createElement('div')
        tagged.classList.add('tags')  
        for (let tag of post.tags) {
            let tagLink = document.createElement('span')
            let tagContent = `<a href="/tagged/${ tag }">#${ tag }</a>`
            tagLink.innerHTML = tagContent
            tagged.append(tagLink)
        }
        article.append(tagged)
    }
    postInfo.classList.add('post-info')
    if (post.noteCount) {
    let notecount = document.createElement('a')
    notecount.href = permalink
    notecount.innerHTML = `Posted ${post.date} with ${post.noteCount}`
    postInfo.append(notecount)
    }
    article.append(postInfo)
    if (permalink === window.location.href) {
        pagination.append(postNotes(post.postNotes))
    }
        // if ask or submit pages 
    if (bodyElement.contains('askpermalink-page') || bodyElement.contains('submit-permalink-page')) {
        let inbox = document.createElement('div')
        inbox.classList.add('text-content')
        inbox.innerHTML = post.inboxBody
        article.append(inbox)
    }
    // append post element to container
    container.append(article)
}
