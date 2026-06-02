const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text.replace(/<[^>]*>/g, '').trim();
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeText(req.body[key]);
      } else if (Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].map(item => typeof item === 'string' ? sanitizeText(item) : item);
      }
    }
  }
  next();
};

const validateRegistration = (req, res, next) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'fullName, email, password, and role are required' });
  }
  if (!['ADMIN', 'RECRUITER', 'CANDIDATE'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role value' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  next();
};

const validateCreateJob = (req, res, next) => {
  const { title, description, location, salary, jobType, skillsRequired } = req.body;
  if (!title || !description || !location || !salary || !jobType) {
    return res.status(400).json({ message: 'Title, description, location, salary, and jobType are required' });
  }
  if (!['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT'].includes(jobType)) {
    return res.status(400).json({ message: 'Invalid jobType value' });
  }
  next();
};

module.exports = {
  sanitizeInput,
  validateRegistration,
  validateLogin,
  validateCreateJob,
};
