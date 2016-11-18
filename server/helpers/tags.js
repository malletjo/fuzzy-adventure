import Promise from 'bluebird';
import ogs from 'open-graph-scraper';
import APIError from './APIError';

export const meta = {
    extract: (url) => {
       return new Promise(function(resolve, reject) {
            let options = {'url': url};
            ogs(options, function(err, results) {
                if (err !== false) {
                    reject(new APIError("invalid URL"));
                } else {
                    resolve(results.data);
                }
            });            
        });  
    }
}