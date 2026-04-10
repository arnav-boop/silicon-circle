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