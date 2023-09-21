import { ApolloServer, UserInputError, gql } from 'apollo-server';
import { v1 as uuid } from 'uuid';
const persons = [
  {
    // age: 18,
    name: 'Pablo',
    phone: '12345678',
    street: 'Urquiza',
    city: 'Buenos Aires',
    id: 'asdffsdfdsf2342341234',
  },
  {
    // age: 12,
    name: 'Juan',
    street: 'Calle 13',
    city: 'Barcelona',
    id: 'asdffsdfdsf2342dddddddddddddddd341234',
  },
  {
    // age: 10,
    name: 'Mike',
    phone: '123456748',
    street: 'sfddsf',
    city: 'Barcelona',
    id: 'asdffssdfdsfdsfdfdsf2342341234',
  },
];

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  input EditPhoneNumberInput {
    person: String!
    phone: String!
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    street: String!
    city: String!
    address: Address!
    check: String!
    canDrink: Boolean!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person

    editNumber(input: EditPhoneNumberInput!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
      if (!args.phone) return persons;
      const byPhone = (person) =>
        args.phone === 'YES' ? person.phone : !person.phone;
      return persons.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Mutation: {
    addPerson: (root, args) => {
      if (persons.find((p) => p.name === args.name)) {
        throw new UserInputError('Name must be unique', {
          invalidArgs: args.name,
        });
      }

      const person = { ...args, id: uuid() };
      persons.push(person);
      return person;
    },
    editNumber: (root, args) => {
      const personIndex = persons.findIndex(
        (p) => p.name === args.input.person
      );
      if (personIndex === -1) return null;
      const updatedPerson = {
        ...persons[personIndex],
        phone: args.input.phone,
      };
      persons[personIndex] = updatedPerson;
      return updatedPerson;
    },
  },

  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    // canDrink: (root) => root.age && root.age > 18,
    // address: (root) => `${root.street},${root.city}`,
    // check: () => 'Pablo =)',
  },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
