# sms-splitter
Intelligently splits SMS messages into multiple messages, with support for Mustache templates.

Sending SMS messages to a service like Twilio can be very hit or miss with regards to the quality of the messages delivered. The reasons are two fold. 

- Messages are split every 160 characters, regardless of context.  This means they can be split in the middle of words, or in the middle of a single piece of information such as an address.
- Messages are often delivered out of order due to mobile networks not guaranteeing order of delivery.

Both of these result in a bad user experience. 

sms-splitter can help with this.  It offers the following functionality

- Split your messages ahead of time.  This lets you send them on your own schedule, not all at once, helping them arrive in the right order (you have to do this part yourself of course, as it is specific to how your service sents SMS messages).
- Always split on spaces, never in the middle of a word or number.
- Split around meaningful parts of the message, for example a person's name or an address.  This is achieved by providing it with a Mustache template and data to populate the template.  sms-splitter will make every effort to always keep all the content of each token in the same single SMS message.

## Usage

### Split a simple message
```
const {split} = require('sms-splitter');

const input = 'This is a long message with not much going on at all. I suppose it is really just showing that a message longer that 160 characters will be split properly on spaces, and not in the middle of a word, and not in the middle of the word spaces';

// The simplest usage.  Default to splitting at 160 characters
const messages = split(input);

// Result: Note that by default sms-splitter adds " ..." at the end of a message.  This can be overridden, as shown below.
// [
//    'This is a long message with not much going on at all. I suppose it is really just showing that a message longer that 160 characters will be split properly ...',
//   'on spaces, and not in the middle of a word, and not in the middle of the word spaces'
// ]
```

### Split with a tokenized string and a custom message length
```
const {split} = require('sms-splitter');

const input = 
  'Hello {{name}}, at {{time}} please arrive at {{address}} for your appointment.';

const values = {
  name: 'Jane Doe',
  time: '10am',
  address: '42, Wallaby Way, Sydney, Australia'
};

// Note the value 50, which is a custom message length
const messages = split(input, values, 50);

// Result: Note how the address is all kept in one text message, when 
// a naive splitter would have split it in the middle.
// [
//   'Hello Jane Doe, at 10am please arrive at ...',
//   '42, Wallaby Way, Sydney, Australia ...',
//   'for your appointment.'
// ]
```

### Split with a custom ellipses and message length
```
const {split} = require('sms-splitter');

const input = 'Hello {{name}}, at {{time}} please arrive at {{address}} for your appointment.';

const values = {
  name: 'Jane Doe',
  time: '10am',
  address: '42, Wallaby Way, Sydney, Australia'
};

// Note the value 50, which is a customer message length
const messages = split(input, values, 50, '');

// Result: Note the lack of "..." at the end of each message
// [
//   'Hello Jane Doe, at 10am please arrive at',
//      '42, Wallaby Way, Sydney, Australia',
//      'for your appointment.'
// ]
```

