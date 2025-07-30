const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Development Environment...\n');

// Start backend server
console.log('📡 Starting Backend Server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n🌐 Starting Frontend Server...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      REACT_APP_API_URL: 'http://localhost:5000/api',
      PORT: 3000
    }
  });

  frontend.on('error', (error) => {
    console.error('❌ Frontend Error:', error);
  });

  frontend.on('close', (code) => {
    console.log(`\n🔴 Frontend process exited with code ${code}`);
  });
}, 3000);

backend.on('error', (error) => {
  console.error('❌ Backend Error:', error);
});

backend.on('close', (code) => {
  console.log(`\n🔴 Backend process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill('SIGTERM');
  process.exit(0);
}); 