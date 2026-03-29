export interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  origin?: string;
  readTime: string;
  content: string[]; // split by paragraphs
  italicParagraphs?: number[]; // indices of paragraphs that should be italicized
  audioFile?: string; // name of the narration file in assets
  audioDuration?: string; // human readable duration like "1:15"
}

export interface Category {
  id: string;
  title: string;
  subtitle: string;
  countLabel: string;
  accentColor: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'cozy',
    title: 'Cozy readings',
    subtitle: 'Warm stories for quiet nights',
    countLabel: '2 stories',
    accentColor: '#E8C88A',
  },
  {
    id: 'folklore',
    title: 'Folklore & legends',
    subtitle: 'Timeless tales from ancient cultures',
    countLabel: '2 stories',
    accentColor: '#C4AED8',
  },
  {
    id: 'reflective',
    title: 'Reflective essays',
    subtitle: 'Gentle thoughts to quiet the mind',
    countLabel: '2 stories',
    accentColor: '#8B6DAE',
  },
  {
    id: 'wonder',
    title: 'World wonders',
    subtitle: 'Awe that puts the soul at ease',
    countLabel: '2 stories',
    accentColor: '#C8DEF0',
  },
];

export const STORIES: Story[] = [
  // FOLKLORE
  {
    id: 'moon-rabbit',
    title: 'The moon rabbit',
    subtitle: 'A rabbit who lives in the moon\'s gentle light',
    category: 'folklore',
    origin: 'East Asian',
    readTime: '3 min read',
    content: [
      "In every culture across East Asia, they speak of the rabbit who lives in the moon. Long ago, when the world was new, a rabbit chose silence over speech, kindness over cleverness. As a reward, the moon invited her to live in its gentle light, where she tends a small garden of immortal flowers.",
      "Every night, she grinds her mortar and pestle—some say making medicine, others say making dreams. The sound is soft, rhythmic, endless. She doesn't rush. She doesn't worry. She simply tends what is hers, knowing that her quiet work matters even if no one is watching.",
      "On nights when you cannot sleep, the rabbit is still working. Your restlessness doesn't bother her. She grinds her pestle. The moon watches over both of you.",
      "And in that shared silence, you are less alone."
    ],
    italicParagraphs: [2, 3],
  },
  {
    id: 'gifts-sea',
    title: 'The gifts of the sea',
    subtitle: 'A selkie\'s choice and the wisdom of staying',
    category: 'folklore',
    origin: 'Selkie folklore',
    readTime: '2 min read',
    content: [
      "A woman from the sea came ashore one autumn evening, leaving her seal skin folded on a rock like a prayer. She walked into the village as if she had always belonged there.",
      "No one asked where she came from. They could see it in her eyes—the salt, the depth, the ancient knowing. She lived quietly at the edge of the village, in a small cottage where she grew gardens that thrived in rain.",
      "Sometimes visitors would ask, \"Don't you miss the sea?\" She would smile and say, \"The sea is in me. I carry it wherever I go. But here, I am learning what it means to stay.\"",
      "One night, under a full moon, she walked to the shore. Her seal skin was still there, waiting. She held it for a long time. Then she folded it smaller, placed it in a wooden box, and buried it beneath the garden.",
      "\"I'm staying,\" she whispered to the moon. And the moon, who had watched her journey from the depths, was content."
    ],
    italicParagraphs: [4],
  },
  // COZY
  {
    id: 'tea-master',
    title: "The tea master's morning",
    subtitle: 'A quiet ritual of warmth and presence',
    category: 'cozy',
    readTime: '2 min read',
    content: [
      "Every morning at dawn, Kenji rises before the world wakes. His hands know the ritual without his mind needing to direct them.",
      "Water heated to exactly the right temperature. Tea leaves measured with intention. The bowl rinsed three times—once for practice, once for presence, once for gratitude.",
      "He sits in his small room where the light filters through paper screens. The steam rises from the bowl. He breathes it in. This is all there is: the warmth, the green, the silence.",
      "Guests sometimes come to his studio. They arrive tense, rushing, full of the noise of the city. He prepares tea for them without speaking. He has learned that words interrupt peace.",
      "Outside, the world moves fast. But here, in this small room, time moves at the pace of a single breath.",
      "Kenji sits again. He prepares a second bowl, just for himself. Not because he needs the caffeine. Because he needs the remembering—that in the midst of everything, there is always this: the present moment, warm in your hands."
    ],
    italicParagraphs: [5],
    audioFile: 'narration-tea-master.mp3',
    audioDuration: '1:15',
  },
  {
    id: 'shelter-storm',
    title: 'Shelter in the storm',
    subtitle: 'Finding warmth and safety in Cotswolds rain',
    category: 'cozy',
    readTime: '2 min read',
    content: [
      "The storm came suddenly, the way autumn storms do. A traveler—weary from the road, shoulders bent with the weight of small sadnesses—ducked into a stone inn nestled in the Cotswolds.",
      "The innkeeper was not a talkative woman. She simply prepared a room, brought hot tea without being asked, and left fresh towels. A fire crackled softly in the hearth.",
      "\"Will the storm pass?\" the traveler asked. \"It always does,\" the innkeeper said. \"But that's not why you stay during a storm. You stay for shelter.\"",
      "The traveler left lighter than they had arrived. Not because their problems had been solved, but because for five nights, they had been held safely. And that was enough."
    ],
    italicParagraphs: [3],
  },
  // REFLECTIVE
  {
    id: 'letting-go',
    title: 'On letting go',
    subtitle: 'The lightness that comes from release',
    category: 'reflective',
    readTime: '2 min read',
    content: [
      "There is a season when you must stop trying to fix things. Not because you've failed. But because some things were never meant to be fixed—only released.",
      "Nothing breaks when you let it go. That's the secret no one tells you. The breaking happened long ago, in the holding.",
      "Release is not giving up. It's recognizing the difference between what you can carry and what you were never meant to hold.",
      "Your rest does not depend on control. Your peace does not require that everything stay the same.",
      "And what needs to stay will stay. What needs to leave will leave. And you will be okay either way."
    ],
    italicParagraphs: [4],
  },
  {
    id: 'small-rituals',
    title: 'The beauty of small rituals',
    subtitle: 'The quiet conversations we have with ourselves',
    category: 'reflective',
    readTime: '2 min read',
    content: [
      "Rituals are not superstition. They are a conversation with yourself. They are the way your hands remember what your mind has forgotten: that you are worthy of care.",
      "These small acts are a rebellion against chaos. They say: \"In the midst of everything that is uncertain, here is this. Here is your thing. Here is what you control.\"",
      "The most powerful rituals are the invisible ones. The ones you do for yourself, in private, with no one to witness or applaud. Those are the truest.",
      "Tonight, choose one small ritual. Make it yours.",
      "Not because it changes anything. But because it reminds you that you are still here. Still caring for yourself. Still showing up."
    ],
    italicParagraphs: [4],
  },
  // WONDER
  {
    id: 'memory-stars',
    title: 'The memory of stars',
    subtitle: 'Light from the past that finds us tonight',
    category: 'wonder',
    readTime: '3 min read',
    content: [
      "Every star you see tonight has been traveling toward you for years. Some for centuries. The stars are showing you something older. Something that has already survived.",
      "Astronomers tell us that stars are born in clouds of dust and gas. You are looking at resurrection, again and again, written in light across the sky.",
      "The stars don't apologize for being small. They don't dim themselves because the night is vast. They simply shine, because that is what they are.",
      "Tonight, you can do the same."
    ],
    italicParagraphs: [3],
  },
  {
    id: 'cities-light',
    title: 'Cities of light',
    subtitle: 'The glowing life of the bioluminescent sea',
    category: 'wonder',
    readTime: '2 min read',
    content: [
      "There are places on Earth where the water glows. Not with electricity. But with life itself. Bioluminescent dinoflagellates—microscopic creatures—light up when disturbed.",
      "You do not need to understand your own beauty for it to exist. You do not need to be aware of your impact for it to matter.",
      "The ocean of light is made of creatures that will never know they are luminous. And yet, they transform the night.",
      "Perhaps you are more like them than you think."
    ],
    italicParagraphs: [3],
  },
];
