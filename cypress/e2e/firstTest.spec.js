


describe('first test', () => {

    beforeEach('login', () => {
        cy.intercept({ method: 'GET', path: 'tags' }, { fixture: 'tags.json' }) //stubbed
        cy.LoginToApplication()
    })

    it('Verify correct request and response', () => {
        //TODO: need to intercept before api being hit
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticle') //simply listener

        //TODO: Hit
        cy.contains(' New Article ').click()
        cy.get('[formcontrolname="title"]').type('This is the article title')
        cy.get('[placeholder="What\'s this article about?"]').type('This is the artice description')
        cy.get('[placeholder="Write your article (in markdown)"]').type('This is the article body')
        // cy.get('[placeholder="Enter tags"]')
        cy.contains(" Publish Article ").click()

        //TODO: accessing post api request
        cy.wait('@postArticle').then(xhr => {
            console.log(xhr);
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.request.body.article.body).to.equal('This is the article body')
            expect(xhr.response.body.article.description).to.equal('This is the artice description')
        })

        cy.contains(' Delete Article ').click()
    })

    it('verify popular tags are displayed', () => {
        cy.get('.tag-list')
            .should('contain', 'cypress')
            .and('contain', 'automation')
            .and('contain', 'testing')
    })


    it('verify global feed likes count', () => {
        //TODO: Provide the response with self-made response via fixture to isolate the UI and Backend
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', { "articles": [], "articlesCount": 0 }) //wildcard will count all api hits regardless the value that come after the feed
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json' })

        //TODO: action and validation made on the UI
        cy.contains('Global Feed').click()
        cy.get('app-article-list').find('button').then(heartList => {
            expect(heartList[0]).to.contain('1')
            expect(heartList[1]).to.contain('5')

        })

        //TODO: Accessing data test and modify them. 
        cy.fixture('articles').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 6
            //TODO: Supply the api resonse when hit (logic behind the API will be not run)
            cy.intercept('POST', `https://api.realworld.io/api/articles/${articleLink}/favorite`, file)
        })
        cy.get('app-article-list').find('button').eq(1).click().should('contain', '6')
    })

    it('Intercepting and modifying the request and response', () => {
        //TODO: need to intercept before hitting the api
        // cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
        //     req.body.article.description = "This is the article description 2"
        // }).as('postArticle') //simply listener

        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) => {
            req.reply(res => {
                expect(res.body.article.description).to.equal('This is the article description')
                console.log(res);
                res.body.article.description = "This is the article description 2"
            })
        }).as('postArticle') //simply listener

        //TODO: Hit
        cy.contains(' New Article ').click()
        cy.get('[formcontrolname="title"]').type('This is the article title')
        cy.get('[placeholder="What\'s this article about?"]').type('This is the article description')
        cy.get('[placeholder="Write your article (in markdown)"]').type('This is the article body')
        // cy.get('[placeholder="Enter tags"]')
        cy.contains(" Publish Article ").click()

        //TODO: accessing post api request
        cy.wait('@postArticle').then(xhr => {
            console.log(xhr);
            expect(xhr.response.statusCode).to.equal(201)
            expect(xhr.request.body.article.body).to.equal('This is the article body')
            expect(xhr.response.body.article.description).to.equal('This is the article description 2')
        })

        cy.contains(' Delete Article ').click()
    })



    it.only('getting token', () => {
        const userCredential = { user: { email: "rafid.muhammad@gmail.com", password: "12345678" } }

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "Request from API",
                "description": "API testing is easy",
                "body": "Angular is cool"
            }
        }


        cy.request('POST', 'https://api.realworld.io/api/users/login', userCredential).its('body').then(body => {
            const token = body.user.token


            //TODO: provide the token retrieved
            cy.request({
                url: 'https://api.realworld.io/api/articles/',
                headers: {
                    'Authorization': 'Token ' + token
                },
                method: 'POST',
                body: bodyRequest


            }).then(response => {
                expect(response.status).to.equal(200)
            })

        })




    })
})