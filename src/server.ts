import App from './App';

App.listen(
    App.get('port'),
    () => console.log(`Server running on http://${App.get('host')}:${App.get('port')}`),
);
