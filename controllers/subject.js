var express = require('express');

var router = express.Router();


function isTeacher(role){
    return role=='teacher';
}

router.get('/list', function (req, res) {
    if(isTeacher(req.user.role)){
        req.app.models.subject.find().then(function(subjects){
            res.render('subjects/list', {
                subjects: subjects,
                isTeacher: isTeacher(req.user.role),
            });
            
        });
    } else {
        req.app.models.subject.find({user: req.user.id}).then(function(subjects){
            var s = 0;
            for(var i=0; i<subjects.length; i++){
                s+=parseInt(subjects[i].credit);
            }
            res.render('subjects/list', {
                subjects: subjects,
                isTeacher: isTeacher(req.user.role),
                sum: s
                
            });
            
        });
    }
    
});

router.post('/list', function (req, res) {
    var subs = [];
    req.app.models.subject.find().then(function(subjects){
      for(var i=0; i<subjects.length; i++){
          if(req.body[subjects[i].id]=='on'){
              subs.push(subjects[i].id);
          }
      }
      req.app.models.subject.destroy(subs).then(function(subjects,err){
          console.log(err);
      });
      
      res.redirect('/subjects/list');
    });
});

router.get('/new', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('subjects/new', {
        validationErrors: validationErrors,
        data: data,
    });
});
router.post('/new', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('subject_name', 'Hibás tárgynév').notEmpty().withMessage('Kötelező megadni!').len(3,32).withMessage('Legalább 3 karakter!');
    
    req.checkBody('credit', 'Hibás kredit').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    
    if (validationErrors) {
        // űrlap megjelenítése a hibákkal és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/subjects/new');
    }
    else {
        // adatok elmentése (ld. később) és a hibalista megjelenítése
        
        var code = 'IP-' +  req.body.subject_name[0] + req.body.subject_name[1] + '15' + req.body.subject_name[req.body.subject_name.length-1];
        //var code = "IP-valami";
        //var teacherName = 'asd';
        var teacherName = req.user.surname+' '+req.user.forename;
        req.app.models.subject.create({
            subject_code: code,
            subject_name: req.body.subject_name,
            credit: req.body.credit,
            teacher: teacherName,
            user: req.user.id
        })
        .then(function (subject) {
            //siker
            req.flash('info', 'Tárgy sikeresen hozzáadva!');
            res.redirect('/subjects/list');
        })
        .catch(function (err) {
            console.log(err);
            res.redirect('/subjects/list');
        });
      
    }
});

module.exports = router;
