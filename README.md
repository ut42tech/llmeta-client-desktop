# LLMeta Client Desktop

A 3D multiplayer metaverse client built with Next.js, React Three Fiber, and Colyseus.

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm

### Installation & Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Create a `.env.local` file and add your Colyseus server endpoint:
    ```
    NEXT_PUBLIC_SERVER_ENDPOINT=ws://localhost:2567
    ```
    *Note: You need to have a Colyseus server running separately.*

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Controls

- **Move:** WASD
- **Camera:** Drag mouse
- **Jump:** Spacebar
- **Debug Panel:** Adjust settings via the Leva panel in the top-right corner.

## Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production build.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Runs the linter.
- `pnpm format`: Formats the code.