 const { expect } = require('chai')
 const knex = require('knex')
 const app = require('../src/app')
const { makeArticlesArray } = require('./articles.fixtures')

 describe.only('Articles Endpoints', function() {
        let db;

        before('make knex instance', () => {
            db = knex({
                client: 'pg',
                connection: process.env.TEST_DB_URL,
            })
            app.set('db', db)
        });

        after('disconnect from database', () => db.destroy())

        before('clean database', () => db('blogful_articles').truncate())

        afterEach('cleanup', () => db('blogful_articles').truncate())

        describe(`GET /articles`, () => {
            context(`Given no articles`, () => {
                it(`Response with 200 and an empty list`, () => {
                    return supertest(app)
                        .get('/articles')
                        .expect(200, [])
                })
            })

            context('Given there are articles in the database', () => {
              const testArticles = makeArticlesArray()
        
              beforeEach('insert articles', () => {
                return db
                  .into('blogful_articles')
                  .insert(testArticles)
              })
        
              it('responds with 200 and all of the articles', () => {
                return supertest(app)
                  .get('/articles')
                  .expect(200, testArticles)
              })
            })
          })
        
          describe(`GET /articles/:article_id`, () => {
            context(`Given no articles`, () => {
                it(`Should respond with a 404`, () => {
                    const articleId = 1234567;
                    return supertest(app)
                        .get(`/articles/${articleId}`)
                        .expect(404, { error: { message:  `Article doesn't exist` } })
                })
            })

            context('Given there are articles in the database', () => {
              const testArticles = makeArticlesArray()
        
              beforeEach('insert articles', () => {
                return db
                  .into('blogful_articles')
                  .insert(testArticles)
              })
        
              it('GET /article/:article_id responds with 200 and the specified article', () => {
                const articleId = 2
                const expectedArticle = testArticles[articleId - 1]
                return supertest(app)
                  .get(`/articles/${articleId}`)
                  .expect(200, expectedArticle)
              })
            })
          })
 })