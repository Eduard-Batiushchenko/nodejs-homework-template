const express = require('express')
const router = express.Router()
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateContactStatus,
} = require('../../service/contacts')

router.get('/', async (_, res) => {
  listContacts().then(data => res.status(200).send(data))
})

router.get('/:contactId', async (req, res) => {
  const id = req.params.contactId
  getContactById(id)
    .then(data => res.status(200).send(data))
    .catch(e => res.status(404).json({ message: 'Not Found' }))
})

router.post('/', async (req, res) => {
  const { name, email, phone, favorite } = req.body
  addContact(name, email, phone, favorite)
    .then(data => res.status(201).send(data))
    .catch(e => res.status(400).json({ message: e.message }))
})

router.delete('/:contactId', async (req, res) => {
  const id = req.params.contactId
  removeContact(id)
    .then(() => res.status(200).json({ message: 'Contact deleted' }))
    .catch(() => res.status(404).json({ message: 'Not Found' }))
})

router.put('/:contactId', async (req, res) => {
  const id = req.params.contactId
  try {
    const response = await updateContact(id, req.body)
    res.status(200).send(response)
  } catch (error) {
    res.status(400).json({ message: `Not Found  ${error.message}` })
  }
})

router.patch('/:contactId/favorite', async (req, res) => {
  const id = req.params.contactId
  const favorite = Object.prototype.hasOwnProperty.call(req.body, 'favorite')

  if (!favorite) {
    return res.status(400).json({ message: 'missing field favorite' })
  }
  try {
    const response = await updateContactStatus(id, req.body)
    res.status(200).send(response)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

module.exports = router
