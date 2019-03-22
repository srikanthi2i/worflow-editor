const modalOptions = [{
    'name': 'Textfield',
    'key': 'email',
  },
  {
    'name': 'Textfield11',
    'key': 'email',
  },
  {
    'name': 'Select',
    'key': 'name',
    "values": {
      "id": 4,
      "first_name": "Eve",
      "last_name": "Holt",
      "avatar": "https://s3.amazonaws.com/uifaces/faces/twitter/marcoramires/128.jpg"
    }
  },
  {
    'name': 'Select',
    'key': 'id',
    'sourceType': 'URL',
    'url': 'https://reqres.in/api/users?page=2',
    'dataPath': 'data',
    'valueProperty': 'id',
    'labelProperty': 'id'
  },
  {
    'name': 'Textarea',
    'key': 'address',
  },
  {
    'name': 'CheckBox',
    'key': 'hobbies',
  },
  {
    'name': 'radio',
    'key': 'gender',
  },
];

export default modalOptions;