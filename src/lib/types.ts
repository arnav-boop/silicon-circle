export interface Profile {
  id: string
  username: string
  avatar_url?: string
  bio?: string
  interests?: string[]
  created_at: string
}

export interface Post {
  id: string
  title: string
  content: string
  author_id: string
  author?: Profile
  likes: number
  comments: number
  created_at: string
}

export interface Idea {
  id: string
  title: string
  description: string
  problem: string
  solution: string
  sketch_url?: string
  author_id: string
  author?: Profile
  upvotes: number
  created_at: string
}

export interface IdeaComment {
  id: string
  idea_id: string
  content: string
  author_id: string
  author?: Profile
  parent_id?: string | null
  upvotes: number
  created_at: string
  attachment_url?: string
}

export interface Hackathon {
  id: string
  title: string
  description: string
  date: string
  url?: string
  participants: number
  joined?: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  author: string
  url?: string
  likes: number
  created_at: string
}

export interface Channel {
  id: string
  name: string
  topic?: string
  category: string
  created_by: string
}

export interface Message {
  id: string
  channel_id: string
  content: string
  sender_id: string
  sender_email?: string
  sender_username?: string
  sender?: Profile
  created_at: string
  reply_to_id?: string | null
  reply_to_content?: string | null
  attachment_url?: string
  upvote_count?: number
}

export interface Hackathon {
  id: string
  title: string
  description: string
  date: string
  url?: string
  participants: number
  joined?: boolean
}

export interface Project {
  id: string
  title: string
  description: string
  tech: string[]
  author: string
  url?: string
  likes: number
  created_at: string
}

export interface Channel {
  id: string
  name: string
  topic?: string
  category: string
  created_by: string
}

export interface Message {
  id: string
  channel_id: string
  content: string
  sender_id: string
  sender_email?: string
  sender_username?: string
  sender?: Profile
  created_at: string
  reply_to_id?: string | null
  reply_to_content?: string | null
  attachment_url?: string
  upvote_count?: number
}

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Welcome to Silicon Circle!',
    content: 'Hey everyone! Welcome to our new tech community. This is a space for teens passionate about technology, coding, and innovation. Lets build something amazing together!',
    author_id: '1',
    likes: 42,
    comments: 12,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'New AI Tools Released - What Do You Think?',
    content: 'The latest AI developments are incredible! From better code completion to image generation, these tools are changing how we approach programming. Share your thoughts on the latest tech!',
    author_id: '2',
    likes: 38,
    comments: 24,
    created_at: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Hackathon Season is Here!',
    content: 'Several major hackathons are coming up this season. Great opportunities to build, learn, and potentially win prizes. Check out the hackathons section to join!',
    author_id: '1',
    likes: 56,
    comments: 18,
    created_at: '2024-01-13T09:00:00Z'
  }
]

export const mockHackathons: Hackathon[] = [
  {
    id: '1',
    title: 'Global Teen Hackathon 2024',
    description: 'A 48-hour hackathon for teens worldwide. Build something awesome with AI, sustainability, or education theme.',
    date: '2024-02-15',
    participants: 156,
  },
  {
    id: '2',
    title: 'Code for Climate',
    description: 'Environmental hackathon focused on climate solutions. Create apps that help with sustainability and conservation.',
    date: '2024-03-01',
    participants: 89,
  },
  {
    id: '3',
    title: 'EduTech Challenge',
    description: 'Build tools to improve education accessibility. For all ages and subjects.',
    date: '2024-03-20',
    participants: 234,
  }
]

export const mockChannels: Channel[] = [
  { id: '1', name: 'general', topic: 'Chat about anything tech', category: 'Community', created_by: '1' },
  { id: '2', name: 'python', topic: 'Python programming discussions', category: 'Languages', created_by: '1' },
  { id: '3', name: 'web-dev', topic: 'Web development tips and help', category: 'Languages', created_by: '1' },
  { id: '4', name: 'ai-ml', topic: 'AI and Machine Learning', category: 'Topics', created_by: '1' },
  { id: '5', name: 'game-dev', topic: 'Game development and design', category: 'Topics', created_by: '1' },
  { id: '6', name: 'help', topic: 'Get help with your code', category: 'Support', created_by: '1' },
  { id: '7', name: 'projects', topic: 'Showcase your projects', category: 'Community', created_by: '1' }
]

export const mockMessages: Record<string, Message[]> = {
  '1': [
    { id: '1', channel_id: '1', content: 'Hey everyone! Welcome to Silicon Circle!', sender_id: '1', created_at: '2024-01-15T10:00:00Z' },
    { id: '2', channel_id: '1', content: 'Excited to be here! Just started learning Python.', sender_id: '2', created_at: '2024-01-15T10:05:00Z' },
    { id: '3', channel_id: '1', content: 'Nice! I can help you get started. What do you want to build?', sender_id: '1', created_at: '2024-01-15T10:10:00Z' },
  ]
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Discord Bot for Study Groups',
    description: 'A Discord bot that helps organize study groups with reminders, quizzes, and progress tracking.',
    tech: ['Python', 'Discord.py', 'SQLite'],
    author: 'code_wizard',
    likes: 42,
    created_at: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Personal Portfolio Website',
    description: 'My portfolio site built with Next.js and Tailwind. Features dark mode and smooth animations.',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
    author: 'web_dev_king',
    likes: 38,
    created_at: '2024-01-08T15:30:00Z'
  },
  {
    id: '3',
    title: 'AI Image Generator',
    description: 'Web app that generates images from text using stable diffusion. Has a gallery and sharing feature.',
    tech: ['Python', 'FastAPI', 'React'],
    author: 'ai_enthusiast',
    likes: 67,
    created_at: '2024-01-05T09:00:00Z'
  },
  {
    id: '4',
    title: 'Mobile Fitness Tracker',
    description: 'Track workouts, calories, and progress with this cross-platform mobile app.',
    tech: ['React Native', 'Firebase'],
    author: 'fitness_coder',
    likes: 29,
    created_at: '2024-01-03T12:00:00Z'
  },
  {
    id: '5',
    title: 'Browser-Based Game Engine',
    description: 'A simple 2D game engine that runs in the browser. Great for beginners learning game dev.',
    tech: ['JavaScript', 'HTML5 Canvas'],
    author: 'game_creator',
    likes: 51,
    created_at: '2024-01-01T08:00:00Z'
  }
]

export const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Collaborative Code Editor',
    description: 'Real-time collaborative code editor with video chat and voice commentary',
    problem: 'Remote teams struggle to pair program effectively. Existing solutions lack integrated communication features.',
    solution: 'Web-based Monaco editor with WebRTC video/audio, cursor tracking, and voice notes that can be left at specific code locations.',
    sketch_url: '/sketch-1.svg',
    author_id: '1',
    author: { id: '1', username: 'code_wizard', created_at: '2024-01-13T09:00:00Z' },
    upvotes: 42,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'AI-Powered Study Buddy',
    description: 'Personalized learning assistant that adapts to your study style',
    problem: 'Students waste time on ineffective study methods. One-size-fits-all approaches don\'t work for different learning styles.',
    solution: 'ML algorithm analyzes your learning patterns and generates custom quizzes, flashcards, and explanations tailored to how you learn best.',
    sketch_url: '/sketch-2.svg',
    author_id: '2',
    author: { id: '2', username: 'web_dev_king', created_at: '2024-01-12T10:00:00Z' },
    upvotes: 38,
    created_at: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Green Code Scanner',
    description: 'Tool that measures and suggests optimizations for code carbon footprint',
    problem: 'Developers don\'t consider environmental impact of inefficient code. No tools exist to measure code\'s energy consumption.',
    solution: 'Static analysis tool that estimates energy usage of algorithms and suggests optimizations, with gamification to encourage efficient code.',
    sketch_url: '/sketch-3.svg',
    author_id: '1',
    author: { id: '1', username: 'code_wizard', created_at: '2024-01-13T09:00:00Z' },
    upvotes: 56,
    created_at: '2024-01-13T09:00:00Z'
  },
  {
    id: '4',
    title: 'AR Debugging Assistant',
    description: 'Augmented reality overlay that visualizes code execution in 3D space',
    problem: 'Debugging complex systems is mentally taxing. Traditional debuggers show linear data that\'s hard to visualize.',
    solution: 'AR glasses or phone camera shows data structures and code flow as 3D objects you can walk around and interact with.',
    sketch_url: '/sketch-4.svg',
    author_id: '3',
    author: { id: '3', username: 'ai_enthusiast', created_at: '2024-01-11T14:00:00Z' },
    upvotes: 31,
    created_at: '2024-01-12T14:00:00Z'
  },
  {
    id: '5',
    title: 'Podcast to Blog Converter',
    description: 'AI that transforms technical podcasts into searchable, structured documentation',
    problem: 'Great technical content exists only in audio form, making it hard to reference or search later.',
    solution: 'Transcribe podcasts, extract key concepts, code snippets, and create markdown/blog posts with proper formatting and links.',
    sketch_url: '/sketch-5.svg',
    author_id: '2',
    author: { id: '2', username: 'web_dev_king', created_at: '2024-01-12T10:00:00Z' },
    upvotes: 45,
    created_at: '2024-01-11T11:30:00Z'
  },
  {
    id: '6',
    title: 'Open Source Resume Builder',
    description: 'Community-driven project that builds resumes from your GitHub activity',
    problem: 'Traditional resumes don\'t showcase actual coding ability. GitHub profiles are too raw for recruiters.',
    solution: 'Analyze commit history, PRs, projects, and automatically generate visually appealing resumes with skill metrics and project highlights.',
    sketch_url: '/sketch-6.svg',
    author_id: '1',
    author: { id: '1', username: 'code_wizard', created_at: '2024-01-13T09:00:00Z' },
    upvotes: 67,
    created_at: '2024-01-10T08:45:00Z'
  }
]

export const mockIdeaComments: Record<string, IdeaComment[]> = {
  '1': [
    {
      id: 'c1',
      idea_id: '1',
      content: 'This would be amazing for hackathons! Could you add shared terminals too?',
      author_id: '2',
      author: { id: '2', username: 'web_dev_king', created_at: '2024-01-14T10:00:00Z' },
      parent_id: null,
      upvotes: 12,
      created_at: '2024-01-15T11:00:00Z'
    },
    {
      id: 'c2',
      idea_id: '1',
      content: 'Shared terminals would be cool but security is tricky. Maybe use Docker containers per user?',
      author_id: '1',
      author: { id: '1', username: 'code_wizard', created_at: '2024-01-13T09:00:00Z' },
      parent_id: 'c1',
      upvotes: 8,
      created_at: '2024-01-15T11:30:00Z'
    },
    {
      id: 'c3',
      idea_id: '1',
      content: 'What about syntax highlighting for 20+ languages out of the box?',
      author_id: '3',
      author: { id: '3', username: 'ai_enthusiast', created_at: '2024-01-12T14:00:00Z' },
      parent_id: null,
      upvotes: 5,
      created_at: '2024-01-15T12:00:00Z'
    }
  ],
  '2': [
    {
      id: 'c4',
      idea_id: '2',
      content: 'How does it handle visual learners who need diagrams?',
      author_id: '1',
      author: { id: '1', username: 'code_wizard', created_at: '2024-01-13T09:00:00Z' },
      parent_id: null,
      upvotes: 15,
      created_at: '2024-01-14T16:00:00Z'
    }
  ]
}