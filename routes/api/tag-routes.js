const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try{
    const result = await Tag.findAll({
      include: {model: Product}
    });
    res.json({payload: result});
  } catch(err){
    if(err){
      res.status(500).json({msg: err.message})
    }
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try{
    const result = await Tag.findOne({
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

router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "Round",
      productIds: [1, 2, 3, 4]
    }
  */
  Tag.create(req.body)
    .then((tag) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.productIds.length) {
        const productTagIdArr = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(tag);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update product data
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      if (req.body.productIds && req.body.productIds.length) {
        
        ProductTag.findAll({
          where: { tag_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ product_id }) => product_id);
          const newProductTags = req.body.productIds
          .filter((product_id) => !productTagIds.includes(product_id))
          .map((product_id) => {
            return {
              tag_id: req.params.id,
              product_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ product_id }) => !req.body.productIds.includes(product_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json("success");
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try{
    await ProductTag.destroy({
      where: {
        tag_id: req.params.id
      }
    });
    await Tag.destroy({
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
