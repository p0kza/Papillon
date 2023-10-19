// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';
import {ApiUrl, ApiVersion, Kdecole} from "kdecole-api";
import displayToast from "@/functions/utils/displayToast";

// main function
async function getNews(forceReload) {
    switch (localStorage.loginService) {
        case "pronote":
            // return pronote news
            return getPronoteNews(forceReload);
        case "ecoledirecte":
            return getEDNews(forceReload)
        case 'skolengo':
            return getSkolengoNews(forceReload)
    }
}

function getSkolengoNews(forceReload) {
    const token = localStorage.getItem('token');
    const ent = localStorage.getItem('ent');
    const etudiant = new Kdecole(token, ApiVersion[ent], 0, 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent])

    let newsCache = localStorage.getItem('NewsCache');
    if (newsCache != null && !forceReload) {
        newsCache = JSON.parse(newsCache);

        const today = new Date();
        const cacheDate = new Date(newsCache.date);

        if (today.toDateString() == cacheDate.toDateString()) {
            return new Promise((resolve) => {
                resolve(constructSkolengoNews(newsCache.news));
            });
        }
    }

    return etudiant.getActualites().then(actu => {
        const today = new Date();
        const newsCache = {
            date: today,
            news: actu
        }
        localStorage.setItem('NewsCache', JSON.stringify(newsCache));

        return new Promise((resolve) => {
            resolve(constructSkolengoNews(actu));
        });
    }).catch((error) => {
        displayToast.presentError(`${error.message}`, "danger", error)
        console.error(error);
    })

}

function constructSkolengoNews(news) {
    return news.map((item) => ({
        title: item.titre,
        content: item.titre,
        htmlContent: 'Rendez vous votre ENT pour consulter le détail de cet article.',
        date: new Date(item.date),
        dateString: new Date(item.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }) + " à " + new Date(item.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}),
        category: item.type,
        author: item.auteur,
        attachments: [],
        isSurvey: false,
        isRead: true,
        isAnonymized: false,
    })).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
}

// pronote : get timetable
function getPronoteNews(forceReload) {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url (date is a TEST date)
    const URL = `${API}/news?token=${token}`;

    // check if timetable is cached
    let newsCache = localStorage.getItem('NewsCache');

    if(newsCache != null && !forceReload) {
        // timetable is cached, check if it's up to date
        newsCache = JSON.parse(newsCache);

        const today = new Date();
        const cacheDate = new Date(newsCache.date);

        if(today.toDateString() == cacheDate.toDateString()) {
            // timetable is up to date, return it
            return new Promise((resolve) => {
                resolve(constructPronoteNews(newsCache.news));
            });
        }
    }

    // send request
    return axios.get(URL)
        .then((response) => {
            if(response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            // save timetable to localstorage cache with today's date
            const today = new Date();
            const newsCache = {
                date: today,
                news: response.data
            }

            localStorage.setItem('NewsCache', JSON.stringify(newsCache));

            // construct timetable and return it as a promise
            return new Promise((resolve) => {
                resolve(constructPronoteNews(response.data));
            });
        })
        .catch((error) => {
            if(error.response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            // error, return error
            if(error.code) {
                // return error code
                return error.code;
            }
        });
}

// pronote : construct timetable
function constructPronoteNews(news) {
    const newsArray = [];

    // for each news in news
    for(let i = 0; i < news.length; i++) {
        // get news
        const newsItem = news[i];

        // if no title, set it to "Sans titre"
        if(newsItem.title == null) {
            newsItem.title = "Sans titre";
        }

        const newsReturn = {
            title: newsItem.title,
            content: newsItem.content,
            htmlContent: newsItem.html_content[0].texte.V,
            date: newsItem.date,
            dateString: new Date(newsItem.date).toLocaleDateString( 'fr-FR', { weekday: 'long', month: 'long', day: 'numeric' }) + " à " + new Date(newsItem.date).toLocaleTimeString( 'fr-FR', { hour: '2-digit', minute: '2-digit' }),
            category: newsItem.category,
            author: newsItem.author,
            attachments: newsItem.attachments,
            isSurvey: newsItem.survey,
            isRead: newsItem.read,
            isAnonymized: newsItem.anonymous_survey,
        }

        newsArray.push(newsReturn);
    }

    // sort news by date
    newsArray.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    return newsArray;
}
//ED: return empty array temporarily to display homepage
function getEDNews(/*forceReload*/) {
    return new Promise((resolve) => {
        resolve([])
    })
}


// export
export default getNews
