const {
    User,
    Book
} = require("../models");
const { AuthenticationError } = require("apollo-server-express");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({
                    _id: context.user._id
                })
                    .select("-__v -password")
                    .populate("savedBooks");

                return userData;
            };

            throw new AuthenticationError("You're not logged in!");
        }
    },
    Mutation: {
        login: async(parent, args) => {
            const user = await User.findOne(args.email);
            if (!user) {
                throw new AuthenticationError("Invalid credentials!");
            };

            const correctPw = await user.isCorrectPassword(args.password);
            if (!correctPw) {
                throw new AuthenticationError("Invalid credentials!");
            };

            const token = signToken(user);
            return {
                token,
                user
            };
        },
        addUser: async(parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return {
                token,
                user
            };
        },
        saveBook: async(parent, args, context) => {
            if (context.user) {
                const user = await User.findByIdAndUpdate(
                    {
                        _id: context.user._id
                    },
                    {
                        $push: { savedBooks: newBook }
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                );

                return user;
            };

            throw new AuthenticationError("You're not logged in!");
        },
        removeBook: async(parent, args, context) => {
            if (context.user) {
                const user = await User.findByIdAndUpdate(
                    {
                        _id: context.user._id
                    },
                    {
                        $pull: { savedBooks: args.bookId }
                    },
                    {
                        new: true,
                        runValidators: true
                    }
                )
            };

            throw new AuthenticationError("You're not logged in!");
        }
    }
};

module.exports = resolvers;