# npf-theme-base
A basic theme using the NPF variable

File overview


- Use [reverse-compatible-template.html](https://github.com/cornetespoir/npf-theme-base/blob/main/reverse-compatible-template.html) if you want to use the HTML blocks *and* have post styling be consistent with legacy post types.

[preview for the HTML blocks and legacy style version of the theme](https://npftemplate.tumblr.com/)

#### all of the other files will not be using the post HTML blocks and rely on the JSON data from the NPF variable

[preview for the NPF variable only version](https://npfbase.tumblr.com)

- Use [full-theme.html](https://github.com/cornetespoir/npf-theme-base/blob/main/full-theme.html) if you intend on editing the JS and/or CSS 
- Use [theme.html](https://github.com/cornetespoir/npf-theme-base/blob/main/theme.html) if you do not want to edit the JS, but do want to edit the CSS
- If you only want to try the JS I wrote for making posts in your own theme, use [npf.js](https://github.com/cornetespoir/npf-theme-base/blob/main/npf.js) and follow the guide below. 
- If you do not intend on using this to release your own theme and just want to try out the theme/use as is, use [theme-all-external-files.html](https://github.com/cornetespoir/npf-theme-base/blob/main/theme-all-external-files.html) if you do not want to edit JS or CSS


## Creating a theme with the NPF variable

For the actual posts, you really only need this section of the html
```HTML
<div id="posts"></div>
{block:PermalinkPagination} 
   <div id="post-pagination">
       <div class="post-buttons">
            {block:PreviousPost}
            <a href="{PreviousPost}">Previous Post</a>
            {/block:PreviousPost}
            {block:NextPost}
            <a href="{NextPost}">Next Post</a>
            {/block:NextPost} 
        </div>
    </div>
{/block:PermalinkPagination}
```
This posts container is the selector used to append all of the post content
``` HTML
<div id="posts"></div>
```

If you do not want to use #posts, change the selector in this in the script

```JS
let container = document.getElementById('posts')
```

The post pagination section is where the post notes will be appended on the permalink page. If you do not want to use previous/next posts, you can remove this section

```HTML
  <div class="post-buttons">
     {block:PreviousPost}
         <a href="{PreviousPost}">Previous Post</a>
            {/block:PreviousPost}
            {block:NextPost}
         <a href="{NextPost}">Next Post</a>
      {/block:NextPost} 
  </div>
```

and you can change the name of the post-pagination id in the HTML, but make sure you also do it here

```JS
let pagination = document.getElementById('post-pagination')
```

I have heavily commented the script to hopefully make it easier for you to edit. You have some control over the kind of information that is being added to the posts array by using different blocks or variables

```JS
// create the post info
  {block:Posts}
    posts.push({
        id: {JSPostID}, 
        // for ask and submit pages
        inboxBody: {JSBody},
        // for post notes on permalink pages
        postNotes: {JSPostNotesURL}, 
        {block:NoteCount}
        // if you do not want "notes" to appear at the end, erase WithLabel
        noteCount: {JSNoteCountWithLabel}, 
        {/block:NoteCount}
        permalink: {JSPermalink},
        npf: JSON.parse({JSNPF}), 
        // if you want to change the date format, replace the TimeAgo block
        date: {JSTimeAgo} 
        {block:HasTags}, 
        tags: [{block:Tags}{JSTag},{/block:Tags}]{/block:HasTags} 
    })
  {/block:Posts}
```

While it is a fully functioning theme on its own, there is not a whole lot of styling/specific formatting applied to these posts, so feel free to change and add as much CSS as you want.
