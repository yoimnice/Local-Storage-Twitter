/*jshint esversion: 6 */

import { tweetsData } from './data.js';
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let myTweets = [];
const TweetsFromLocalStorage = JSON.parse(localStorage.getItem("myTweets"));

if (TweetsFromLocalStorage){
    myTweets = TweetsFromLocalStorage;
} else {
    for (let i=0;i<tweetsData.length;i++){
        myTweets.push(tweetsData[i]);
    }
}

console.log(myTweets);

window.addEventListener('load', function(){
    render();
});

document.addEventListener('click', function(e){
    if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick();
        updateLocalStorage();
    }
    else if (e.target.id === 'darkModeBtn'){
        handleDarkModeBtnClick();
    }
    else if(e.target.dataset.like){
        handleLikeClick(e.target.dataset.like);
        updateLocalStorage();
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet);
        updateLocalStorage();
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply);
    } 
    else if (e.target.dataset.comment){
        handleCommentClick(e.target.dataset.comment);
    }
    else if (e.target.dataset.answer){
        handleAnswerBtnClick(e.target.dataset.answer);
        updateLocalStorage();
    }
    else if (e.target.dataset.trash){
        handleDeleteBtnClick(e.target.dataset.trash);
        updateLocalStorage();
    }
    
});

function updateLocalStorage(){
    localStorage.clear();
    localStorage.setItem("myTweets", JSON.stringify(myTweets));
}

function addToLocalStorage(tweet){
    myTweets.unshift(tweet);
    tweetsData.unshift(tweet);
    localStorage.setItem("myTweets", JSON.stringify(myTweets));
}

function handleDarkModeBtnClick(){
    document.body.classList.toggle("dark-theme");
    render();
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input');
    if(tweetInput.value){
        const tweetObject = 
        {
            handle: `me`,
            profilePic: `images/memoji-happy.jpg`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            ownTweet: true,
            uuid: uuidv4()
        };
        addToLocalStorage(tweetObject);
    render();
    tweetInput.value = '';
    }
}

function handleLikeClick(tweetId){ 
    const targetTweetObj = myTweets.filter(function(tweet){
        return tweet.uuid === tweetId;
    })[0];

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--;
    }
    else{
        targetTweetObj.likes++ ;
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked;
    render();
}

function handleRetweetClick(tweetId){
    const targetTweetObj = myTweets.filter(function(tweet){
        return tweet.uuid === tweetId;
    })[0];
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--;
    }
    else{
        targetTweetObj.retweets++;
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
    render() ;
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden');
}

function handleCommentClick(commentId){
    document.getElementById(`replies-${commentId}`).classList.remove('hidden');
    document.getElementById(`comment-field-${commentId}`).classList.remove('hidden');
}

function handleAnswerBtnClick(answerId){
    const commentInput = document.getElementById(`reply-textarea-${answerId}`);
    
    if(commentInput.value){
        const targetTweetObj = myTweets.filter(function(tweet){
            const tweetId = tweet.uuid.includes(answerId);
            if (tweetId){
                return tweetId;
            }
        })[0];

        targetTweetObj.replies.unshift({
            handle: `me`,
            profilePic: `images/memoji-happy.jpg`,
            tweetText: `${commentInput.value}`,
        });
    }
    render();
    commentInput.value = '';
}

function handleDeleteBtnClick(tweetId){
    let targetTweetObj = myTweets.filter(function(tweet){
        return tweet.uuid === tweetId;
    })[0];
    for (let i = 0; i < myTweets.length; i++){
        if (myTweets[i] === targetTweetObj){
            myTweets.splice(i, 1);
        }
    }
    render();
}

function getFeedHtml(){
    let feedHtml = ``;
    myTweets.forEach(function(tweet){
        
        let trashIconClass = 'style="display:none"';
        if (tweet.ownTweet){
            trashIconClass = '';
        }

        let likeIconClass = '';
        
        if (tweet.isLiked){
            likeIconClass = 'liked';
        }
        
        let retweetIconClass = '';
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted';
        }
        
        let repliesHtml = '';

            repliesHtml =`
<div id="comment-field-${tweet.uuid}" class="tweet-comment hidden">
<div class="tweet-inner">
    <img src="images/memoji-happy.jpg" class="profile-pic">
        <div>
            <p class="handle">me</p>
            <textarea id="reply-textarea-${tweet.uuid}" class="reply-textarea" placeholder="What's happening?"></textarea>
            <button id="answer-btn" data-answer="${tweet.uuid}">Answer</button>
        </div>
    </div>
</div>
`;

        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`;
            });
        }
        
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-solid fa-reply"
                    data-comment="${tweet.uuid}"
                    ></i>
                </span>
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-trash" ${trashIconClass}
                    data-trash="${tweet.uuid}"
                    ></i>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`;
   });
   return feedHtml ;
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml();
}
