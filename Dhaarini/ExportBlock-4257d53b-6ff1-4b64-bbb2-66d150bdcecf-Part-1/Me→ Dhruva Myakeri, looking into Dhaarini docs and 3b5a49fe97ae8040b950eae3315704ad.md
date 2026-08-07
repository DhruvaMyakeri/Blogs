# Me→ Dhruva Myakeri, looking into Dhaarini docs and documenting my thoughts here

So dhaarini is an earth intelligence backbone ,  so basically its not a single foundation model. It is something that wants to prevent the “re-learning” of earth from scratch for every new task, sector and geo.

A “earth model” as it is referred to as in the docs. hmm so a searchable memory of the “EARTH” , and one of the core bets is to adapt it cheaply for downstream products.

the layers

![image.png](image%202.png)

hmm,  the earth memory is pretty , so basically theres no discarding of embeddings after use, preserve them. **(SPOILER ALERT, I HAVE REDACTED THE next analogy)** , (would it be fine if for now i picture it as how google maps street view functions), but this is from the satellite, which captures even more coarse, and fine details **(spans to multiple sensors and resolutions, optical, Sar, weather, terrain etc)** and from my conversation with Satish J i remember him mention about multiple sorts of sensors and types of data, so yea hmm, (actually i have a tick in my brain for this technical part ill address after my next point) the docs also mention on why designing this as an india first is advantageous, since it has the hardest geospatial environments  , and love the reasoning .

![image.png](image%203.png)

so with this and coming to address my tick in the brain, but unlike a street view, sorry for assuming that as a subject if its wrong but i feel when it comes to modelling the earth, thats what comes to my mind,  so the thesis rests on the assumption that intelligence learned once transfers across geographies and tasks. but geospatial data is non-stationary. umm so yea thats what ticked my brain for a bit,

**this is where i realise my analogy is wrong btw**

actually uk what i would like to redact my analogy to the street view, thats a photo archive indexed by location, earth memory is an embedding space “similarity” , like how face rec embeddings let you search by resemblance .

if u train one region and test on another, the accuracy drop is visible prolly, and that can be used as a sort of a metric

I myself have built self supervised representation models and fought the embedding collapse, the failure mode id watch is that a shared embedding space either collapses or overfits, to the dominant regions’, 

So rn i havent understood everything correctly since i havnt gone deep into understanding and working on this space, and to broaden my understanding i am building a smol version of this , kinda, a self supervised embedding on indian sentinel 2 crop data, probed cheaply to test the reuse bet, and tested across regions to actually see the transfer drop rather than theorize it. 

New to the “geospatial” side ,so gonna get started with the basics,,,,, so anyways these are questions i’m testing , not conclusions, umm, so yea

happy to share what i learn