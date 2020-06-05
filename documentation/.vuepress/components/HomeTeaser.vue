<template>
    <div>
        <div class="teaser">
            <div class="topBlock">
                <div class="textTeaser">
                    <h2 class="title">Schema based data validation for javascript</h2>
                    <p class="text">
                        Validate object fields using simple schema.
                        Works in browser or server side. Packs no dependencies and weighs less than 2KB.
                    </p>
                    <router-link class="ctaBtn" :to="'/about.html'">View documentation</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.teaser {
    background: #f5f5f5;
    min-height: 100vh; min-height: calc(100vh - 58px);
    display: flex; justify-content: center; align-items: center;
    background: #f5f5f5 url('/validate-types/logo-white.svg') no-repeat center;
    background-size: 600px;
}

@media screen and (min-width: 720px) {
    .teaser {
        background-position: center;
        background-size: 700px;
    }
}

.topBlock {
    position: relative; padding: 25px;
}

@media screen and (min-width: 720px) {
    .topBlock {
        display: table;
        padding: 140px 40px 160px; max-width: 1100px; margin: 0 auto;
    }
}

.textTeaser {
    max-width: 600px; padding-bottom: 25px;
}

@media screen and (min-width: 720px) {
    .textTeaser {
        display: table-cell; padding-right: 35px; padding-top: 35px;
        vertical-align: middle;
    }
}

.textTeaser > .title {
    font-size: 32px; margin: 0; position: relative;
    padding: 0 0 20px 0;
    letter-spacing: -0.015em;
    font-weight: bold;
    border: 0;
}

@media screen and (min-width: 720px) {
    .textTeaser > .title {
        font-size: 46px;
    }
}

.textTeaser > .text {
    color: #585858; margin: 0;
}

.ctaBtn {
    display: inline-block; padding: 12px 20px;
    margin-top: 23px;
    border-radius: 25px; letter-spacing: -0.3px;
    background: #7485c2; color: #fff;
    transition: background-color 0.3s;
}

.ctaBtn:hover, .ctaBtn:focus {
    background-color: #7485c2;
    text-decoration: none !important;
}
</style>
