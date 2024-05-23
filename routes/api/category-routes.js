const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try{
    const result = await Category.findAll({
      include: Product
    });
    res.json({payload: result});
  } catch(err){
    if(err){
      res.status(500).json({msg: err.message})
    }
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try{
    const result = await Category.findOne({
      where: {
        id: req.params.id
      },
      include: Product
    });
    res.json({payload: result});
  } catch(err){
    if(err){
      res.status(500).json({msg: err.message})
    }
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try{
    const result = await Category.create(req.body);
    res.json({payload: result});
  } catch(err){
    if(err){
      res.status(500).json({msg: err.message})
    }
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try{
    const result = await Category.update(
      req.body,
      {
      where: {
        id: req.params.id
      }
    });
    res.json({payload: "success"});
  } catch(err){
    if(err){
      res.status(500).json({msg: err.message})
    }
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try{
    await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    res.json({payload: "success"});
  } catch(err){
    if(err){
      res.status(500).json({msg: err.message})
    }
  }
});

module.exports = router;
