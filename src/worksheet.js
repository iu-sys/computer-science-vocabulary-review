export const WORKSHEET_GROUPS = [
  {
    id: "p1-definition-matching",
    label: "PDF Page 1 · Definition Matching",
    page: 1,
    type: "definition-matching",
    wordBank: [
      { id: "algorithm", term: "algorithm", vocabularyId: "p1-exercise-algorithm" },
      { id: "machine-learning", term: "machine learning", vocabularyId: "p1-exercise-machine-learning" },
      { id: "automation", term: "automation", vocabularyId: "p1-exercise-automation" },
      { id: "deep-learning", term: "deep learning", vocabularyId: "p1-exercise-deep-learning" },
      { id: "big-data", term: "big data", vocabularyId: "p1-exercise-big-data" },
      { id: "artificial-intelligence", term: "artificial intelligence", vocabularyId: "p1-exercise-artificial-intelligence" },
      { id: "data-mining", term: "data mining", vocabularyId: "p1-exercise-data-mining" },
      { id: "internet-of-things", term: "Internet of Things (IoT)", vocabularyId: "p1-exercise-internet-of-things" },
      { id: "chatbot", term: "chatbot", vocabularyId: "p1-exercise-chatbot" },
      { id: "natural-language-processing", term: "natural language processing", vocabularyId: "p1-exercise-natural-language-processing" },
      { id: "turing-test", term: "Turing Test", vocabularyId: "p1-exercise-turing-test" },
      { id: "neural-networks", term: "neural networks", vocabularyId: "p1-exercise-neural-networks" }
    ],
    prompts: [
      { id: "p1-definition-01", text: "A procedure, instructions, or formula for solving a problem or completing a task.", answerId: "algorithm" },
      { id: "p1-definition-02", text: "A core sub area of AI by which computer programs can “learn” and automatically modify its knowledge, procedures, and processes to improve performance and efficiency.", answerId: "machine-learning" },
      { id: "p1-definition-03", text: "The technique of making a machine, a process, or a system operate automatically.", answerId: "automation" },
      { id: "p1-definition-04", text: "A subset of machine learning that uses complex algorithms to mimic the brain’s neural network to learn, with little or no human supervision.", answerId: "deep-learning" },
      { id: "p1-definition-05", text: "A collection of data sets so large and complex that it becomes difficult to process using most typical data management tools. This is the raw fuel of AI, as it provides the inputs for surfacing patterns and making predictions.", answerId: "big-data" },
      { id: "p1-definition-06", text: "The simulation of human intelligence by machines. Or more simply, having machines “think like a human.”", answerId: "artificial-intelligence" },
      { id: "p1-definition-07", text: "The process of combing through large sets of information to discover patterns and extract useful information.", answerId: "data-mining" },
      { id: "p1-definition-08", text: "A network of billions of digitally connected devices that collect and exchange data. These devices can also be programmed to communicate with one another to better serve users.", answerId: "internet-of-things" },
      { id: "p1-definition-09", text: "A computer program that simulates human conversation.", answerId: "chatbot" },
      { id: "p1-definition-10", text: "A machine learning task that finds patterns within large data sets in order to recognize everyday language. This field of study drives better human-computer interaction and aids machines in better understanding human language.", answerId: "natural-language-processing" },
      { id: "p1-definition-11", text: "An assessment developed in 1950 to evaluate the ability of a machine to mimic human behaviour. It involves a human evaluator who undertakes natural language conversations with another human and a machine and rates the conversations.", answerId: "turing-test" },
      { id: "p1-definition-12", text: "Learning models based on the human nervous system and brain. Based on the activity of neurons, they are used to solve tasks that would be too difficult for traditional methods of programming.", answerId: "neural-networks" }
    ]
  },
  {
    id: "p2-definition-matching",
    label: "PDF Page 2 · Definition Matching",
    page: 2,
    type: "definition-matching",
    wordBank: [
      { id: "primed", term: "primed", vocabularyId: "p2-exercise-primed" },
      { id: "sentient", term: "sentient", vocabularyId: "p2-exercise-sentient" },
      { id: "threaten", term: "threaten", vocabularyId: "p2-exercise-threaten" },
      { id: "hurdle", term: "hurdle", vocabularyId: "p2-exercise-hurdle" },
      { id: "optical-character-recognition", term: "Optical Character Recognition (OCR)", vocabularyId: "p2-exercise-optical-character-recognition" },
      { id: "breakthrough", term: "breakthrough", vocabularyId: "p2-exercise-breakthrough" },
      { id: "track-down", term: "track down", vocabularyId: "p2-exercise-track-down" },
      { id: "warning-sign", term: "warning sign", vocabularyId: "p2-exercise-warning-sign" },
      { id: "obsolete", term: "obsolete", vocabularyId: "p2-exercise-obsolete" },
      { id: "virtual-assistant", term: "virtual assistant", vocabularyId: "p2-exercise-virtual-assistant" }
    ],
    prompts: [
      { id: "p2-definition-01", text: "to be a danger to someone or something; likely to cause harm or damage", answerId: "threaten" },
      { id: "p2-definition-02", text: "to find something or someone after looking for them in a lot of different places", answerId: "track-down" },
      { id: "p2-definition-03", text: "a sudden solution of a problem leading to further advances, especially in science", answerId: "breakthrough" },
      { id: "p2-definition-04", text: "the branch of computer science that involves a computer reading printed or written text", answerId: "optical-character-recognition" },
      { id: "p2-definition-05", text: "a problem or difficulty", answerId: "hurdle" },
      { id: "p2-definition-06", text: "ready to do a specific action", answerId: "primed" },
      { id: "p2-definition-07", text: "technology that is no longer used because something new has been invented", answerId: "obsolete" },
      { id: "p2-definition-08", text: "an early signal that something bad or dangerous might happen", answerId: "warning-sign" },
      { id: "p2-definition-09", text: "a computer program or device connected to the internet that can understand spoken questions and instructions, designed to help you make plans, find answers to questions, etc.", answerId: "virtual-assistant" },
      { id: "p2-definition-10", text: "able to perceive or feel things; conscious", answerId: "sentient" }
    ]
  },
  {
    id: "p2-article-definition-matching",
    label: "PDF Page 2 · Highlighted Article Vocabulary",
    page: 2,
    type: "definition-matching",
    wordBank: [
      { id: "self-sufficient", term: "self-sufficient", vocabularyId: "p2-article-self-sufficient" },
      { id: "backbone", term: "backbone", vocabularyId: "p2-article-backbone" },
      { id: "constant-feedback-loop", term: "constant feedback loop", vocabularyId: "p2-article-constant-feedback-loop" },
      { id: "overlooked", term: "overlooked", vocabularyId: "p2-article-overlooked" },
      { id: "unpredictable", term: "unpredictable", vocabularyId: "p2-article-unpredictable" },
      { id: "nuances", term: "nuances", vocabularyId: "p2-article-nuances" },
      { id: "indistinguishable", term: "indistinguishable", vocabularyId: "p2-article-indistinguishable" },
      { id: "uncover", term: "uncover", vocabularyId: "p2-article-uncover" },
      { id: "mountains-of-relevant-data", term: "mountains of relevant data", vocabularyId: "p2-article-mountains-of-relevant-data" },
      { id: "contextual-meaning", term: "contextual meaning", vocabularyId: "p2-article-contextual-meaning" }
    ],
    prompts: [
      { id: "p2-article-definition-01", text: "able to do or produce everything that you need without the help of other people", answerId: "self-sufficient" },
      { id: "p2-article-definition-02", text: "core", answerId: "backbone" },
      { id: "p2-article-definition-03", text: "when outputs of a system are routed back as inputs as part of a chain of cause-and-effect", answerId: "constant-feedback-loop" },
      { id: "p2-article-definition-04", text: "to fail to see or notice something", answerId: "overlooked" },
      { id: "p2-article-definition-05", text: "likely to change suddenly and without reason, so it cannot be foreseen or expected", answerId: "unpredictable" },
      { id: "p2-article-definition-06", text: "fine differences and gradations of meaning", answerId: "nuances" },
      { id: "p2-article-definition-07", text: "impossible to judge as being different when compared to another similar thing", answerId: "indistinguishable" },
      { id: "p2-article-definition-08", text: "to discover something that was previously hidden or secret", answerId: "uncover" },
      { id: "p2-article-definition-09", text: "vast quantities of information", answerId: "mountains-of-relevant-data" },
      { id: "p2-article-definition-10", text: "understanding language and words from how they are used in practice", answerId: "contextual-meaning" }
    ]
  },
  {
    id: "p3-definition-matching-a",
    label: "PDF Page 3 · Definition Matching A",
    page: 3,
    type: "definition-matching",
    wordBank: [
      { id: "settle", term: "settle", vocabularyId: "p3-exercise-settle" },
      { id: "counterfeit", term: "counterfeit", vocabularyId: "p3-exercise-counterfeit" },
      { id: "claim", term: "claim", vocabularyId: "p3-exercise-claim" },
      { id: "quantify", term: "quantify", vocabularyId: "p3-exercise-quantify" },
      { id: "predictive", term: "predictive", vocabularyId: "p3-exercise-predictive" },
      { id: "spectrum-sharing", term: "spectrum sharing", vocabularyId: "p3-exercise-spectrum-sharing" },
      { id: "maintenance", term: "maintenance", vocabularyId: "p3-exercise-maintenance" },
      { id: "mainstream", term: "mainstream", vocabularyId: "p3-exercise-mainstream" },
      { id: "labelled-data", term: "labelled data", vocabularyId: "p3-exercise-labelled-data" },
      { id: "advancement", term: "advancement", vocabularyId: "p3-exercise-advancement" },
      { id: "diagnostics", term: "diagnostics", vocabularyId: "p3-exercise-diagnostics" },
      { id: "generative-adversarial-network", term: "Generative Adversarial Network (GAN)", vocabularyId: "p3-exercise-generative-adversarial-network" }
    ],
    prompts: [
      { id: "p3a-definition-01", text: "mass market", answerId: "mainstream" },
      { id: "p3a-definition-02", text: "identifying a particular illness or problem using a combination of signs and symptoms", answerId: "diagnostics" },
      { id: "p3a-definition-03", text: "a computer system that forecasts what is wanted or needed is ________", answerId: "predictive" },
      { id: "p3a-definition-04", text: "the work needed to keep a road, building, machine, etc. in good condition", answerId: "maintenance" },
      { id: "p3a-definition-05", text: "helping something to make progress or succeed", answerId: "advancement" },
      { id: "p3a-definition-06", text: "measure, assess, evaluate", answerId: "quantify" },
      { id: "p3a-definition-07", text: "a type of machine learning system, where two neural networks contest with each other in a zero-sum game framework", answerId: "generative-adversarial-network" },
      { id: "p3a-definition-08", text: "to pay, especially money that is owed", answerId: "settle" },
      { id: "p3a-definition-09", text: "an object that is not genuine, but has been made to look like the original of something, usually for dishonest or illegal purposes", answerId: "counterfeit" },
      { id: "p3a-definition-10", text: "a group of samples with one specific meaning or tag", answerId: "labelled-data" },
      { id: "p3a-definition-11", text: "a written request to an organization to pay you money which you believe it owes you", answerId: "claim" },
      { id: "p3a-definition-12", text: "the simultaneous usage of a specific radio frequency band in a specific geographical area by a number of independent entities", answerId: "spectrum-sharing" }
    ]
  },
  {
    id: "p3-definition-matching-b",
    label: "PDF Page 3 · Definition Matching B",
    page: 3,
    type: "definition-matching",
    wordBank: [
      { id: "address", term: "address", vocabularyId: "p3-exercise-address" },
      { id: "determination", term: "determination", vocabularyId: "p3-exercise-determination" },
      { id: "stalker", term: "stalker", vocabularyId: "p3-exercise-stalker" },
      { id: "lawsuit", term: "lawsuit", vocabularyId: "p3-exercise-lawsuit" },
      { id: "surveillance", term: "surveillance", vocabularyId: "p3-exercise-surveillance" },
      { id: "mugshot", term: "mugshot", vocabularyId: "p3-exercise-mugshot" },
      { id: "come-under-fire", term: "come under fire", vocabularyId: "p3-exercise-come-under-fire" },
      { id: "landmark", term: "landmark", vocabularyId: "p3-exercise-landmark" },
      { id: "mitigate", term: "mitigate", vocabularyId: "p3-exercise-mitigate" },
      { id: "pore", term: "pore", vocabularyId: "p3-exercise-pore" },
      { id: "reading", term: "reading", vocabularyId: "p3-exercise-reading" },
      { id: "biometric", term: "biometric", vocabularyId: "p3-exercise-biometric" }
    ],
    prompts: [
      { id: "p3b-definition-01", text: "a photograph taken by the police of a person who has been charged with a crime", answerId: "mugshot" },
      { id: "p3b-definition-02", text: "to be criticized severely for something you have done", answerId: "come-under-fire" },
      { id: "p3b-definition-03", text: "a distinctive easily recognizable feature, building or place which helps you navigate and know where you are.", answerId: "landmark" },
      { id: "p3b-definition-04", text: "a claim or complaint against somebody that a person or an organization can make in court", answerId: "lawsuit" },
      { id: "p3b-definition-05", text: "using measurements of human features, such as fingers or eyes, in order to identify people", answerId: "biometric" },
      { id: "p3b-definition-06", text: "a measurement; the amount or number shown on an instrument used for measuring something", answerId: "reading" },
      { id: "p3b-definition-07", text: "the careful watching of a person or place, especially by the police or army, because of a crime that has happened or is expected", answerId: "surveillance" },
      { id: "p3b-definition-08", text: "to give attention to or deal with a matter, problem or issue", answerId: "address" },
      { id: "p3b-definition-09", text: "a person who illegally follows and watches someone over a period of time", answerId: "stalker" },
      { id: "p3b-definition-10", text: "one of the very small holes in your skin that sweat can pass through", answerId: "pore" },
      { id: "p3b-definition-11", text: "to make something less harmful, serious, unpleasant, bad etc.", answerId: "mitigate" },
      { id: "p3b-definition-12", text: "the act of finding out or calculating something", answerId: "determination" }
    ]
  },
  {
    id: "p4-definition-matching-a",
    label: "PDF Page 4 · Definition Matching A",
    page: 4,
    type: "definition-matching",
    wordBank: [
      { id: "suspicious", term: "suspicious", vocabularyId: "p4-exercise-suspicious" },
      { id: "shoplifter", term: "shoplifter", vocabularyId: "p4-exercise-shoplifter" },
      { id: "accustomed", term: "accustomed", vocabularyId: "p4-exercise-accustomed" },
      { id: "tailor", term: "tailor", vocabularyId: "p4-exercise-tailor" },
      { id: "donation", term: "donation", vocabularyId: "p4-exercise-donation" },
      { id: "impostor", term: "impostor", vocabularyId: "p4-exercise-impostor" },
      { id: "retailer", term: "retailer", vocabularyId: "p4-exercise-retailer" },
      { id: "brainy", term: "brainy", vocabularyId: "p4-exercise-brainy" }
    ],
    prompts: [
      { id: "p4a-definition-01", text: "a gift of money or goods to a charity, fund or collection in order to help them", answerId: "donation" },
      { id: "p4a-definition-02", text: "to make or adapt something for a particular purpose; to customize", answerId: "tailor" },
      { id: "p4a-definition-03", text: "a person or business that sells goods to the public", answerId: "retailer" },
      { id: "p4a-definition-04", text: "feeling that somebody has done something wrong, illegal or dishonest, without having any proof", answerId: "suspicious" },
      { id: "p4a-definition-05", text: "very intelligent", answerId: "brainy" },
      { id: "p4a-definition-06", text: "familiar with something and accepting it as normal or usual", answerId: "accustomed" },
      { id: "p4a-definition-07", text: "a person who steals goods from a store by deliberately leaving without paying for them", answerId: "shoplifter" },
      { id: "p4a-definition-08", text: "a person who pretends to be somebody else in order to trick people", answerId: "impostor" }
    ]
  },
  {
    id: "p4-definition-matching-b",
    label: "PDF Page 4 · Definition Matching B",
    page: 4,
    type: "definition-matching",
    wordBank: [
      { id: "consensus", term: "consensus", vocabularyId: "p4-exercise-consensus" },
      { id: "peer-to-peer", term: "peer-to-peer", vocabularyId: "p4-exercise-peer-to-peer" },
      { id: "enforce", term: "enforce", vocabularyId: "p4-exercise-enforce" },
      { id: "asset", term: "asset", vocabularyId: "p4-exercise-asset" },
      { id: "ledger", term: "ledger", vocabularyId: "p4-exercise-ledger" },
      { id: "underpin", term: "underpin", vocabularyId: "p4-exercise-underpin" },
      { id: "tamper", term: "tamper", vocabularyId: "p4-exercise-tamper" },
      { id: "decentralized", term: "decentralized", vocabularyId: "p4-exercise-decentralized" },
      { id: "timestamp", term: "timestamp", vocabularyId: "p4-exercise-timestamp" },
      { id: "middleman", term: "middleman", vocabularyId: "p4-exercise-middleman" }
    ],
    prompts: [
      { id: "p4b-definition-01", text: "someone who communicates or makes business transactions between two people or groups", answerId: "middleman" },
      { id: "p4b-definition-02", text: "a book in which things are regularly recorded, especially business activities and money received or paid", answerId: "ledger" },
      { id: "p4b-definition-03", text: "Organizations or activities which are not controlled from one central place, but happen in many different places", answerId: "decentralized" },
      { id: "p4b-definition-04", text: "a record in printed or digital form that shows the time at which something happened or was done", answerId: "timestamp" },
      { id: "p4b-definition-05", text: "to make people obey a law, or to make a particular situation happen or be accepted", answerId: "enforce" },
      { id: "p4b-definition-06", text: "something having value, such as a possession or property, that is owned by a person, business, or organization", answerId: "asset" },
      { id: "p4b-definition-07", text: "to give support, strength, or a basic structure to something, e.g. an argument, process or strategy", answerId: "underpin" },
      { id: "p4b-definition-08", text: "a generally accepted opinion or decision among a group of people", answerId: "consensus" },
      { id: "p4b-definition-09", text: "to make changes to something without permission or illegally, often with the intention of damaging it, or altering it for criminal purposes", answerId: "tamper" },
      { id: "p4b-definition-10", text: "involving sharing files or other resources between computers connected through a network, rather than using a central server", answerId: "peer-to-peer" }
    ]
  },
  {
    id: "p5-definition-matching",
    label: "PDF Page 5 · Definition Matching",
    page: 5,
    type: "definition-matching",
    wordBank: [
      { id: "falsify", term: "falsify", vocabularyId: "p5-exercise-falsify" },
      { id: "immutability", term: "immutability", vocabularyId: "p5-exercise-immutability" },
      { id: "pending", term: "pending", vocabularyId: "p5-exercise-pending" },
      { id: "future-proof", term: "future-proof", vocabularyId: "p5-exercise-future-proof" },
      { id: "funds", term: "funds", vocabularyId: "p5-exercise-funds" },
      { id: "fork", term: "fork", vocabularyId: "p5-exercise-fork" },
      { id: "hash", term: "hash", vocabularyId: "p5-exercise-hash" },
      { id: "downtime", term: "downtime", vocabularyId: "p5-exercise-downtime" },
      { id: "intermediary", term: "intermediary", vocabularyId: "p5-exercise-intermediary" },
      { id: "node", term: "node", vocabularyId: "p5-exercise-node" }
    ],
    prompts: [
      { id: "p5-definition-01", text: "a person or organization that makes business or financial arrangements between companies or organizations that do not deal with each other directly", answerId: "intermediary" },
      { id: "p5-definition-02", text: "about to happen or waiting to happen", answerId: "pending" },
      { id: "p5-definition-03", text: "a place where things such as lines or systems join", answerId: "node" },
      { id: "p5-definition-04", text: "to change a written record or information so that it is no longer true, usually with criminal intentions", answerId: "falsify" },
      { id: "p5-definition-05", text: "a function that converts an input of letters and numbers into an encrypted output of a fixed length", answerId: "hash" },
      { id: "p5-definition-06", text: "what happens when a blockchain diverges into two potential paths forward", answerId: "fork" },
      { id: "p5-definition-07", text: "the ability of a blockchain ledger to remain unchanged, and for a blockchain to remain unaltered", answerId: "immutability" },
      { id: "p5-definition-08", text: "money, often for a specific purpose such a project or business venture", answerId: "funds" },
      { id: "p5-definition-09", text: "the time during which a machine, especially a computer, is not working or is not able to be used", answerId: "downtime" },
      { id: "p5-definition-10", text: "to design software, a computer, etc. so that it can still be used for many years, even when technology changes", answerId: "future-proof" }
    ]
  },
  {
    id: "p6-vr-definition-matching",
    label: "Page 6 繚 VR Mini-glossary",
    page: 6,
    type: "definition-matching",
    wordBank: [
      { id: "vr-face", term: "VR face", vocabularyId: "p6-vr-vr-face" },
      { id: "simulator-sickness", term: "Simulator sickness", vocabularyId: "p6-vr-simulator-sickness" },
      { id: "refresh-rate", term: "Refresh rate", vocabularyId: "p6-vr-refresh-rate" },
      { id: "stitching", term: "Stitching", vocabularyId: "p6-vr-stitching" },
      { id: "field-of-view", term: "Field of view (FOV)", vocabularyId: "p6-vr-field-of-view" },
      { id: "head-tracking", term: "Head tracking", vocabularyId: "p6-vr-head-tracking" },
      { id: "latency", term: "Latency", vocabularyId: "p6-vr-latency" },
      { id: "head-mounted-display", term: "Head mounted display or HMD", vocabularyId: "p6-vr-head-mounted-display" },
      { id: "cinematic-vr", term: "Cinematic VR", vocabularyId: "p6-vr-cinematic-vr" },
      { id: "eye-tracking", term: "Eye tracking", vocabularyId: "p6-vr-eye-tracking" },
      { id: "judder", term: "Judder", vocabularyId: "p6-vr-judder" },
      { id: "social-vr", term: "Social VR", vocabularyId: "p6-vr-social-vr" }
    ],
    prompts: [
      { id: "p6-vr-definition-01", text: "These are the current form of hardware delivering VR experiences to users. It's typically goggles or a helmet of some type, the kind you strap to your face or put on your head. That's where you're viewing the VR experience. Some have sensors for head tracking, some don't.", answerId: "head-mounted-display" },
      { id: "p6-vr-definition-02", text: "This term refers to the sensors that keep up with the movement of the user's head and move the images being displayed so that they match the position of the head. In short, if you're wearing an Oculus Rift, for example, head tracking is what lets you look to the left, right, up, or down, and see the world that's been built in those directions.", answerId: "head-tracking" },
      { id: "p6-vr-definition-03", text: "This term refers to the sensors that read the position of users' eyes versus their head. So for example, there's an HMD called FOVE that integrates eye tracking into their headset. In their demo, the user can aim a weapon by looking in a different direction.", answerId: "eye-tracking" },
      { id: "p6-vr-definition-04", text: "This is the angle of degrees in a visual field. Having a higher field of view is important because it contributes to the user having a feeling of immersion in a VR experience. The viewing angle for a healthy human eye is about 200 degrees. So, the bigger that angle is, the more immersive it feels.", answerId: "field-of-view" },
      { id: "p6-vr-definition-05", text: "This describes the effect during a VR experience, when you turn your head, and you notice the visuals don't quite keep up. It's unpleasant, because that's not something that happens in the real world. That lag is an oft-cited complaint about VR experiences that aren't up to par for a variety of reasons.", answerId: "latency" },
      { id: "p6-vr-definition-06", text: "During a VR experience, this is a conflict between what your brain and body think they're doing, when you feel sick. Your eyes say, \"We're moving!\" And your brain says \"Nope! Let's get nauseated!\". This is one of the big challenges for developers -- figuring out how to move people without making them feel nausea.", answerId: "simulator-sickness" },
      { id: "p6-vr-definition-07", text: "In VR technology, this describes when there is a significant shaking in the images you see. In other words, they are not smooth, but moving in an unpleasant way.", answerId: "judder" },
      { id: "p6-vr-definition-08", text: "If you're looking at a television, or in this case, a virtual reality experience, you're looking at a series of images. This measurement defines how fast those images get updated. A higher reading cuts down on lag, and cutting down on lag means there's less of a chance of getting sick. It also means more responsive experiences. You definitely want to more than 60 frames per second.", answerId: "refresh-rate" },
      { id: "p6-vr-definition-09", text: "This term refers to a type of app that aims to create a shared VR space where users can interact with each other and even participate in activities.", answerId: "social-vr" },
      { id: "p6-vr-definition-10", text: "For the most part, there are two types of VR you'll run into. There's the kind that's computer-generated graphics, and the kind made of real images. This term describes the second kind, and is made using cameras, whether rigs made of mounted GoPros or actual 360 cameras.", answerId: "cinematic-vr" },
      { id: "p6-vr-definition-11", text: "This is the process of taking footage from different cameras, like GoPro cameras that have been used in a 360 camera mount, and combining that footage into spherical video. The process usually involves reorienting video, placing seams, and generally editing it so that it looks like one continuous view, rather than a patchwork of angles.", answerId: "stitching" },
      { id: "p6-vr-definition-12", text: "The slightly embarrassing, slack-jawed look people get on their face when they wear an HMD!", answerId: "vr-face" }
    ]
  },
  {
    id: "p1-sentence-completion",
    label: "PDF Page 1 · Sentence Completion",
    page: 1,
    type: "sentence-completion",
    wordBank: [
      { id: "machine-learning", term: "machine learning", vocabularyId: "p1-exercise-machine-learning" },
      { id: "turing-test", term: "Turing Test", vocabularyId: "p1-exercise-turing-test" },
      { id: "natural-language-processing", term: "natural language processing", vocabularyId: "p1-exercise-natural-language-processing" },
      { id: "internet-of-things", term: "Internet of Things (IoT)", vocabularyId: "p1-exercise-internet-of-things" },
      { id: "deep-learning", term: "deep learning", vocabularyId: "p1-exercise-deep-learning" },
      { id: "big-data", term: "big data", vocabularyId: "p1-exercise-big-data" },
      { id: "neural-networks", term: "neural networks", vocabularyId: "p1-exercise-neural-networks" },
      { id: "data-mining", term: "data mining", vocabularyId: "p1-exercise-data-mining" },
      { id: "chatbot", term: "chatbot", vocabularyId: "p1-exercise-chatbot" },
      { id: "algorithm", term: "algorithm", vocabularyId: "p1-exercise-algorithm" },
      { id: "automation", term: "automation", vocabularyId: "p1-exercise-automation" },
      { id: "artificial-intelligence", term: "artificial intelligence", vocabularyId: "p1-exercise-artificial-intelligence" }
    ],
    prompts: [
      { id: "p1-sentence-01", text: "Netflix’s {{blank}} programming looks at what I watch, and gives me personalized recommendations of other shows I might enjoy.", answerId: "machine-learning" },
      { id: "p1-sentence-02", text: "The Voight-Kampff test from the movie Blade Runner was inspired by the {{blank}}.", answerId: "turing-test" },
      { id: "p1-sentence-03", text: "Stronger {{blank}} helps Siri and Alexa sound less like robots and more like personal assistants.", answerId: "natural-language-processing" },
      { id: "p1-sentence-04", text: "The emergence of the {{blank}} means that companies like Tesla can issue an “over the air” software update that doesn’t require owners to bring their cars to the dealer.", answerId: "internet-of-things" },
      { id: "p1-sentence-05", text: "Google Photos uses {{blank}} to power face recognition in photographs.", answerId: "deep-learning" },
      { id: "p1-sentence-06", text: "More and more of IT’s technology investments will go towards managing {{blank}}.", answerId: "big-data" },
      { id: "p1-sentence-07", text: "{{blank}} are ideally suited to help people solve tricky problems in real-life situations. They can reveal hidden patterns, make predictions, and model fast-changing data.", answerId: "neural-networks" },
      { id: "p1-sentence-08", text: "When Sherlock Holmes enters his ‘mind palace’, he’s recalling all of his memories and knowledge, {{blank}} all the information at his disposal to make deductions and solve his cases.", answerId: "data-mining" },
      { id: "p1-sentence-09", text: "In March 2016, Microsoft introduced Tay, an AI {{blank}} designed to respond to Twitter users, emulate casual speech, and learn from their conversations. It went badly.", answerId: "chatbot" },
      { id: "p1-sentence-10", text: "Facebook’s News Feed {{blank}} changed again. This annoyed, angered and confused users!", answerId: "algorithm" },
      { id: "p1-sentence-11", text: "Marketing {{blank}} allows you simplify email sales campaigns, by putting common tasks on autopilot.", answerId: "automation" },
      { id: "p1-sentence-12", text: "C-3PO in Star Wars is an example of a robot powered by {{blank}}.", answerId: "artificial-intelligence" }
    ]
  }
];
