/**
 * * Handles catch of try catch of async function
 * * and pass error to the next middleware (error function)
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
