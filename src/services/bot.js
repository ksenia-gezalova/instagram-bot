const { IgApiClient } = require("instagram-private-api");
const { sample } = require("lodash");

const userName = () => process.env.USER;
const userPass = () => process.env.PASS;
const parsingAccount = () => process.env.PARSE_ACC;

let usersToIntercat = [];

class Bot {
  constructor() {
    this.ig = new IgApiClient();
  }

  async run(flag) {
    await this.login();

    setInterval(async () => {
      if (!usersToIntercat || usersToIntercat.length < 1) {
        console.log("getting latest post likers");
        this.getLatestPostLikers();
      } else {
        console.log(`we have ${usersToIntercat.length}`);
        const user = usersToIntercat.pop();
        flag === "like" ? await this.like(user) : await this.follow(user.pk);
      }
    }, 60000);
  }

  async follow(userId) {
    console.log("start follow");
    await this.ig.friendship.create(userId);
  }

  async like(user) {
    console.log("start like");
    const userFeed = await this.ig.feed.user(user.pk);
    const userPostsFirstPage = await userFeed.items();
    const userPostsSecondPage = await userFeed.items();
    await this.ig.media.like({
      mediaId: sample([userPostsFirstPage[0].id, userPostsSecondPage[0].id]),
      moduleInfo: {
        module_name: "profile",
        user_id: user.pk,
        username: user.username,
      },
    });
  }

  async getLatestPostLikers() {
    const id = await this.ig.user.getIdByUsername(parsingAccount());
    const feed = await this.ig.feed.user(id);

    const posts = await feed.items();
    usersToIntercat = await (await this.ig.media.likers(posts[0].id)).users;
  }

  async login() {
    this.ig.state.generateDevice(userName());
    await this.ig.simulate.preLoginFlow();
    await this.ig.account.login(userName(), userPass());
    await this.ig.simulate.postLoginFlow();

    console.log("logged");
  }
}

module.exports = new Bot();
