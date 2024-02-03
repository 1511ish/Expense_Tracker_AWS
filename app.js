const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const path = require('path');
var cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');

const User = require('./models/User');
const Expense = require('./models/Expense');
const Order = require('./models/Order')
const ForgetPasswordRequest = require('./models/ForgotPasswordRequests');
const DownloadedFile = require('./models/DownloadedUrl');

const app = express();

const expenseRoutes = require('./routes/expense');
const userRoutes = require('./routes/user');
const purchaseRoutes = require('./routes/purchase');
const premiumFeatureRoutes = require('./routes/premiumFeature');
const passwordRoutes = require('./routes/password');
const { TrustedAdvisor } = require('aws-sdk');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));
 //app.use(helmet());
// it is not requiring as it is not server side rendering.
// app.use(compression());
 //app.use(morgan('combined', { stream: accessLogStream }));


app.use('/home',(req,res,next) => {
    res.sendFile('signup.html',{root:'views'});
})
app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumFeatureRoutes);
app.use('/password', passwordRoutes);
app.get('/', (req, res) => {
    res.sendFile('notFound.html',{root:'views'});
});

User.hasMany(Expense, { onDelete: 'CASCADE' });
Expense.belongsTo(User);

User.hasMany(Order, { onDelete: 'CASCADE' });
Order.belongsTo(User);

User.hasMany(ForgetPasswordRequest, { onDelete: 'CASCADE' });
ForgetPasswordRequest.belongsTo(User);

User.hasMany(DownloadedFile, { onDelete: 'CASCADE', hooks: true })
DownloadedFile.belongsTo(User)


const PORT = process.env.PORT

async function initiate() {
    try {
        await sequelize.sync()
        app.listen(PORT || 3000, () => {
            console.log(`Server running on port ${PORT}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

initiate()   
