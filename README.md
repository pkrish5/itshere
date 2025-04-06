# HomeFood Delivery

A food delivery platform connecting college students with home-cooked meals from their families, leveraging drivers who are already making trips to college campuses.

## Features

- **Driver View**: Optimized route planning and real-time tracking for multiple pickups and dropoffs
- **Sender View**: Track delivery status and add special instructions for the driver
- **Receiver View**: Real-time tracking of incoming food and pickup instructions

## Tech Stack

- React with TypeScript
- Material-UI for the user interface
- Google Maps API for location services
- Firebase for real-time updates and data storage

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Maps API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/home-food-delivery.git
cd home-food-delivery
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Google Maps API key:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── views/         # Main application views
  │   ├── DriverView.tsx
  │   ├── SenderView.tsx
  │   └── ReceiverView.tsx
  ├── App.tsx        # Main application component
  └── index.tsx      # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 