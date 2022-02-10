const express = require('express');
const expressGraphql = require('express-graphql').graphqlHTTP;
const { 
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
    GraphQLString,
    GraphQLNonNull
} = require('graphql')

const app = express();

const authors = [
    {id: 1, name: 'Chinua Achebe'},
    {id: 2, name: 'Wole Soyinka'},
    {id: 3, name: 'Chimamanda Adichie'}
]
const books = [
    {id: 1, name: 'Things fall apart', authorId: 1},
    {id: 2, name: 'No longer at ease', authorId: 1},
    {id: 3, name: 'Chike and the river', authorId: 1},
    {id: 4, name: 'Ake', authorId: 2},
    {id: 5, name: 'The gods must be crazy', authorId: 2},
    {id: 6, name: 'Purple Hibiscus', authorId: 3},
    {id: 7, name: 'Americanah', authorId: 3},
    {id: 8, name: 'Half of a yellow sun', authorId: 3},
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represent the book written by an author',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        authorId: {type: new GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.filter(author => author.id === book.id)
            }
        }
    })
})
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent the author of a book',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            description: 'A list of all the books',
            resolve:  () => books
        },
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'A list of book authors',
            resolve: () => authors,
        },
        author: {
            type: AuthorType,
            description: 'A single author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id === args.id)
            }
        }
    })
    
})

const RootMutation = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Mutation Query',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add a book',
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                 books.push(book)
                 return book

            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add an author',
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                
            },
            resolve: (parent, args) => {
                const author = {
                    name: args.name,
                    id: authors.length + 1
                }
                authors.push(author);
                return author;
            }
        }
    })
})
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutation
})
app.use('/graphql', expressGraphql({
    graphiql: true,
    schema: schema
}))

app.listen(5000, () => {
    console.log('App is running from schema.js file')
})