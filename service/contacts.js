const Contact = require('./schema/contacts-schema')

const listContacts = () => {
  return Contact.find()
}

const getContactById = id => {
  return Contact.findById({ _id: id })
}

const addContact = (name, email, phone, favorite) => {
  return Contact.create({ name, email, phone, favorite })
}

const removeContact = id => {
  return Contact.findByIdAndDelete({ _id: id })
}

const updateContact = (id, body) => {
  return Contact.findOneAndUpdate({ _id: id }, body, { new: true })
}

const updateContactStatus = (id, body) => {
  return Contact.findOneAndUpdate(
    { _id: id },
    { favorite: body.favorite },
    { new: true },
  )
}

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateContactStatus,
}
