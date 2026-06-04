_Build a finance app to democratise investing? Sounds amazing. Let’s deliver information about the market to our users, as fresh as it gets. That would mean finding an up to date API, mining news, creating a speedy processing pipeline … . This would have led to nothing but a monument to technical arrogance. To change human trajectories, you don’t start with code, but with empathy._

![App to change investing](/blog/images/blog2.png)

I’m registered in an online hackathon with the theme of finance: new waters for me at the time. I’d heard about the importance of financial prudence and investing your money wisely, but as a high school student, I’d never dabbled in finance before. But it sounded exciting so my team was fully into the idea of making investing more accessible.

Our first thought was to make an application that did, what we assumed was, the hard part of investing: finding what to invest in. We would build a glimmeringly powerful data processing engine to harness publicly available data and present it to our users. What I could see in my mind was a technological prowess: sophisticated algorithms and lots of optimisation.

Looking back at that moment, I feel embarrassed at this type of project planning. Yet, I still feel this allure of wanting to build a technological marvel. Building my own MCP (Model Context Protocol) servers, for example, seems exciting as a project, not because it will let me automate my existing workflows (it’ll probably take 2 months of work to get even somewhere close), but because it takes me to the frontier of technology today. We as developers love to build novel things and challenging things. It is so hardwired in our mentality that we sometimes struggle to think about the needs that our solution is addressing. 

This build is my story of how I learned to think about the problem before the solution.


## The blueprint

One of our team members was adamant that the idea we had in mind wouldn’t work. Instead, he suggested we should make something more interactive. If not, we would end up scaring potential investors by making them stare down a wall of data. I don’t remember the exact words he said but this is how I processed it:

**Step 1: Empathise** 

An app never starts with a solution but a problem. Sometimes, it is a problem that **you** face but most often, the most successful apps I’ve worked with are problems that a group of people face. 

We knew there was a problem with the youth not being confident in investing. But we didn’t really narrow down on the exact problem they faced. This is when we dove into some research. Blogs and videos are excellent secondary sources to get your search for a problem started. I read a line “Stocks feel like gambling!” and remember thinking “Now that’s the problem”.

In general, what I’ve realised is the more specific the problem, the better the solution will turn out. A vague problem, like “investing uncertainty” or “world poverty” is not something people feel on a day to day basis. In contrast, the more specific problem “lack of awareness about the importance of financial literacy among youth” is something that is both more addressable and easier to reach out to audiences.

**Step 2: Ideate**

No, this is still not the part where you start coding. Here, the focus is to decide which features address the problem the best and which can be left out. I find it useful to have a decision matrix in mind during this process.

I generally go by the principle: the more outlandish the ideas, the more attention they deserve. In this way, you push your app beyond the conventional while ensuring that it is within the realm of what you can reasonably implement.

This is how we decided to make a simple web game to simulate what investing feels like.  We realised that the game is an excellent way to solve the problem because it actively directs users' attention to thinking about investment. Most importantly it was a solution that had existing implementations: web games were a proven concept so we knew it was possible to get it working.

Finally in this step I like to make a detailed plan for the order in which we will implement the features. It's worth reflecting on the plan to ensure that it's maximally efficient so that you don't waste time during the design phase thinking about the broader picture when instead you should be thinking about the code itself. Once you have a good plan, you’ll be confident to dive right in.

**Step 3: Implement**

Only now do we start coding. Start by building a bare bones MVP (Minimum Viable Product) and then move on to the next step. While you can compromise full functionality in the beginning, just remember that whatever you build has to be robust. This is key because what you build now sets the foundation for what you're going to build in the future.

Not having experience with game dev on the web actually became a strength. By building our MVP from the ground up and learning each module inside-out—instead of slapping in boilerplate code—we created a codebase that was inherently flexible. When we move into iteration, we’ll be free to make sweeping design changes without fighting against the original architecture.

**Step 4: Iteration**

I would argue this is the most important phase of the development process.  What you build will never solve 100% of the problem you set out to solve, right off the bat. There will always be features that users prefer to be delivered differently from what you initially had in mind.

For us we realised that the game was quite limited; it only had one level.  Although this was an MVP, it was very hard for us to get user feedback when there was not a lot of time that users spent in the game. Thus, after our initial iteration we decided to add a couple more challenges that force the users to think about different aspects of investing.

Talking to users is essential. If you’re scared to take your app out into the real world, to real users, it's a sign that you haven’t understood their problem fully. This step, in many ways, affirms the work you have done in Step 1. It also takes it one step further as you understand more and more about the target market. Effective iteration ensures that your build stays relevant as users’ demands change.

The hard truth about iteration is that it’s eternal: even post-deployment, you’re still collecting feedback. Your job is to filter each comment—ask whether it’s a single user’s taste or evidence of a broader design or usability problem.


## The ripple effect

It definitely was not the best app we have built. The User Experience was woefully lacking at times and we definitely weren’t financial advisors in the best position to craft situations for our users to face. However, it was a great platform on top of which we could build a better way of delivering knowledge of financial literacy.

![](/blog/images/AD_4nXdbi-KWvGrtZ-P5usZqH0dhzEvfr7gq5_qcuiH_TkFl2EfC5XmMIkoE0U4yOp-l9-jBCV2GXv8pFitDYv78Xfot5tzEKYyvky1QcOik9HWRKepzd13mJpxUCbaYVAvoZuwhBTH2Zw)

_Our gameplay which you can check out through_ [_https://devpost.com/software/liabilities_](https://devpost.com/software/liabilities) _

What I saw as a success from this project was not the technical marvel or perfection of the app but rather the potential this has to improve people’s lives. We created an MVP of a game which offered real value to users. Ideally, we should have done more **iteration** steps, but lack of time halted progress.



Most builders think their value is linked to what they put in their tech stack. I did too. However, technology on its own does not create value: technology solving people’s problems does. So the end-goal of a developer isn’t to write code; rather it is to write futures through what they build.

> _technology on its own does not create value: technology solving people’s problems does_ 

This hack taught me that when I choose what to build, disruption is not the first thing I think of. Rather, it is the human holding the phone. 
