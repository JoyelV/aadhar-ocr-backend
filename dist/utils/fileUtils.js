import fs from "fs";
export const deleteFiles = (paths) => {
    paths.forEach(path => {
        if (fs.existsSync(path))
            fs.unlinkSync(path);
    });
};
