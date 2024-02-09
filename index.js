var express = require("express")
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require("graphql")

//Construct a schema
var contacts = [
  {
    id:1,
    name: "peter parker",
    age: 21,
    email: "peter@mit.edu",
    courses: [
      { number: "1.00", name: "engr comp" },
      { number: "3.00", name: "intro bio" }
    ]
  },
  {
    id:2,
    name: "bruce wayne",
    age: 32,
    email: "bruce@mit.edu",
    courses: [
      { number: "2.00", name: "intro ME" },
      { number: "3.00", name: "intro MS" }
    ]
  },
  {
    id:3,
    name: "diana prince",
    age: 25,
    email: "diana@mit.edu",
    courses: [
      { number: "2.00", name: "intro arch" },
      { number: "1.00", name: "intro chem" }
    ]
  },
];

var restaurants = [
  {
    name: "WoodsHill ",
    description: "American cuisine, farm to table, with fresh produce every day",
    dishes: [
      {
        name: "Swordfish grill",
        price: 27
      },
      {
        name: "Roasted Broccily ",
        price: 11
      }
    ]
  },
  {
    name: "Fiorellas",
    description: "Italian-American home cooked food with fresh pasta and sauces",
    dishes: [
      {
        name: "Flatbread",
        price: 14
      },
      {
        name: "Carbonara",
        price: 18
      },
      {
        name: "Spaghetti",
        price: 19
      }
    ]
  },
  {
    name: "Karma",
    description: "Malaysian-Chinese-Japanese fusion, with great bar and bartenders",
    dishes: [
      {
        name: "Dragon Roll",
        price: 12
      },
      {
        name: "Pancake roll ",
        price: 11
      },
      {
        name: "Cod cakes",
        price: 13
      }
    ]
  }
];


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    contact(id: Int): Contact
    contacts: [Contact]
    restaurant(id:Int): Restaurant
    restaurants: [Restaurant]
  }
  type Contact {
    name: String
    email: String
    age: Int
    courses:[Course]
  }
  type Course {
    number: String
    name: String
  }
  type Restaurant {
    name: String
    description: String
    dishes: [Dish]
  }
  type Dish {
    name: String
    price: Int
  }
  input restaurantInput{
    name: String
    description: String
  }
  input ContactInput{
    name: String
    email: String
    age: Int
  }
  type DeleteResponse{
    ok: Boolean!
  }
  type Mutation{
    setContact(input: ContactInput): Contact
    setrestaurant(input: restaurantInput): Restaurant

    deleterestaurant(id:Int!): DeleteResponse
    editrestaurant(id: Int!, name: String!): Restaurant
    deleteContact(id: Int!): DeleteResponse
    editContact(id: Int!, age: Int!): Contact
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  contact: (arg) => contacts[arg.id],
  contacts: () => contacts,
  setContact : ({input}) => {
    contacts.push({name:input.name,email:input.email,age:input.age})
    return input
  },
  restaurants: () => restaurants,
  restaurant: (arg) => restaurants[arg.id],
  setrestaurant: ({input}) => {
    restaurants.push({name:input.name, description:input.description})
    return input
  },
  deleterestaurant:({id}) => {
    const ok = Boolean(restaurants[id])
    let delc = restaurants[id];
    restaurants = restaurants.slice(id);
    console.log(JSON.stringify(delc))
    return{ok}
  },
  editrestaurant: ({id,name}) => {
    if(!restaurants[id]) {
      throw new Error("restaurant doesn't exist")
    }
    restaurants[id] = {
      name: name ,
      description: restaurants[id].description,
      dishes: restaurants[id].dishes
    }
    return restaurants[id]
  },
  deleteContact: ({id}) => {

    const ok = Boolean(contacts[id])
    let delc = contacts[id];
    contacts = contacts.filter(item => item.id !== id)
    console.log(JSON.stringify(delc))
    return{ok}
  },
  editContact: ({id, ...contact}) => {
    if(!contacts[id]) {
      throw new Error("contact doesn't exist")
    }
    contacts[id] = {
      ...contacts[id], ...contact
    }
    return contacts[id]
  }
}

var app = express()
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
)
app.listen(4000, () => console.log('Running Graphql on Port: 4000'))