const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    getUser: async (_, { userId, username }) => {
      try {
        const foundUser = await User.findOne({
          $or: [{ _id: userId }, { username: username }],
        });
        
        if(!foundUser) {
          throw new Error('Cannot find a user with this id or username!')
        }

        return foundUser;
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    createUser: async (_, { userInput }) => {
      try {
        const user = await User.create(userInput);
        
        if (!user) {
          throw new Error('Couldn\'t create user!');
        }
        
        const token = signToken(user);
        
        return { token, user };
      } catch (error) {
        throw new Error(error);
      }
    },

    login: async (_, { loginInput }) => {
      try {
        const { username, email, password } = loginInput;
        const user = await User.findOne({ $or: [{ username }, { email }] });

        if (!user) {
          throw new Error("Can't find this user!");
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
          throw new Error('Wrong password!');
        }

        const token = signToken(user);

        return { token, user };
      } catch (error) {
        throw new Error(error);
      }
    },

    saveBook: async (_, { bookInput }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
          throw new Error("No user with this id");
        }

        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },

    deleteBook: async (_, { bookId }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("No user with this id");
        }

        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};

module.exports = resolvers;