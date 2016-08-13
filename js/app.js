var todoModel = Backbone.Model.extend({
    defaults:{
        title:'todo',
        checked:false,
        important:false
    },
    changeCheck:function () {
        this.set('checked', !this.get('checked'));
        return this.get('checked');
    },
    changeImport:function () {
        this.set('important', !this.get('important'));
        return this.get('important');
    }
});

var todoCollection = Backbone.Collection.extend({
    model:todoModel,
    getImportant:function () {
        return this.where({important:true})
    },
    getChecked:function () {
        return this.where({checked:true})
    }
});

var todoList = new todoCollection([
    // new todoModel({title:'do something'}),
    // new todoModel({title:'do another thing'})
]);

var todoView = Backbone.View.extend({
    tagName:'li',
    className: 'todo',
    events:{
        'click .check': 'changeCheck',
        'click .icon-flag': 'changeImport',
        'click .icon-pencil': 'editTodo',
        'keyup  .todo-edit': 'editEnd'
    },
    template:_.template('<input type="checkbox" class="check"><%= title %> <span class="icon-bin"></span><span class="icon-pencil"></span><span class="icon-flag"></span>'),
    initialize:function () {
        _.bindAll(this, 'render');
        this.title = this.model.get('title');
        this.check = this.model.get('checked');
        this.impot = this.model.get('important');
        this.model.on('change', this.render);
        this.render();
    },
    render:function () {
        this.$el.html('');
        this.$el.html(this.template({title:this.model.get('title')}));
        this.$el.find('input').prop('checked', this.model.get('checked'));
        this.$el.toggleClass('checked', this.model.get('checked'));
        this.$el.toggleClass('important', this.model.get('important'));
        return this;
    },
    changeCheck: function () {
        this.model.changeCheck();
    },
    changeImport: function () {
        this.model.changeImport();
    },
    editTodo:function () {
        console.log('edit');
        console.log(this.el.innerText);
        this.$el.html('<input type="text" class="todo-edit">');
        this.$el.find('input').val(this.model.get('title'));
        this.$el.find('input').focus();
    },
    editEnd:function (event) {
        if(event.keyCode === 13){
            console.log(event.keyCode);
            var title = this.$el.find('input').val();
            this.model.set('title', title);
            console.log(this.model.get('title'));
        }

    }
});

var todoListView = Backbone.View.extend({
    el:$('#todo-list'),
    events:{
        'change #new-todo': 'addTodo',
        'click .icon-bin' : 'removeTodo',
        'click .filter-important' : 'filter',
        'click .filter-all' : 'filter',
        'click .filter-checked' : 'filter',
    },
    initialize:function () {
        _.bindAll(this, 'render');
        todoList.on('add', this.render);
        todoList.on('remove', this.render);
        this.render();
    },
    render:function (models) {
        var listBox = this.$el.find('#list-box');
        listBox.html('');
        if(models && models.length>0){
            models.forEach(function (todoModel) {
                var view = new todoView({model:todoModel});
                listBox.append(view.render().el);
            });
        }else{
            todoList.each(function (todoModel) {
                var view = new todoView({model:todoModel});
                listBox.append(view.render().el);
            },this);
        }

    },
    addTodo:function (event) {
        var target = event.target;
        todoList.add({title:$(target).val()})
        console.log($(target).val());
        this.$el.find('#new-todo').val('');
    },
    removeTodo:function (event) {
        var target = event.target;
        var index = $(target).parent().index();
        todoList.remove(todoList.models[index]);
    },
    filter:function (event) {
        event.preventDefault();
        var target = event.target;
        var value = $(target).html();
        var models;
        switch(value){
            case 'important':
                models = todoList.getImportant();
                break;
            case 'checked':
                models = todoList.getChecked();
                break;
            default :
                break;
        }
        this.render(models);
    }
});
var app = new todoListView();