const express = require('express');
const expressGraphql = require('express-graphql').graphqlHTTP;

const  {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
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
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represent a Author of a book',
    fields: () => ({
        id: { type:  new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(AuthorType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represent the Book written by an author',
    fields: () => ({
        id: { type:  new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type:  new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.filter(author => author.id === book.id)
            }
        }
    })
})
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single Book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of All Books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'A single Author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent,args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book);
                return book
            }

        },
        addAuthor: {
            type: AuthorType,
            description: 'Add a author',
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)}
               
            },
            resolve: (parent,args) => {
                const author ={
                    id: authors.length + 1,
                    name: args.name,
                }
                authors.push(author);
                return author
            }

        }
    })
})
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphql({
    schema: schema,
    graphiql: true
    
}));
app.listen(5000, () => {
    console.log('Server is running!!')
})