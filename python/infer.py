import argparse
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline, DDIMScheduler

def main(args):
    scheduler = DDIMScheduler(beta_start=0.00085, beta_end=0.012, beta_schedule="scaled_linear", clip_sample=False, set_alpha_to_one=False)
    if args.model_path is None:
        pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", revision="fp16", torch_dtype=torch.float16).to("cuda")
    else:
        pipe = StableDiffusionPipeline.from_pretrained(args.model_path, scheduler=scheduler, safety_checker=None, torch_dtype=torch.float16).to("cuda")

    g_cuda = torch.Generator(device='cuda').manual_seed(args.seed)

    with autocast("cuda"), torch.inference_mode():
        images = pipe(
            args.prompt,
            negative_prompt=args.negative_prompt,
            num_images_per_prompt=args.num_images_per_prompt,
            guidance_scale=args.guidance_scale,
            num_inference_steps=args.num_inference_steps,
            height=args.height,
            width=args.width,
            generator=g_cuda
        ).images

    for index, img in enumerate(images):
        img.save(f"output_{index}.png")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()

    parser.add_argument('--prompt', required=True)
    parser.add_argument('--model_path')
    parser.add_argument('--negative_prompt')
    parser.add_argument('--seed', type=int, default=52362)
    parser.add_argument('--num_images_per_prompt', type=int, default=1)
    parser.add_argument('--guidance_scale', type=int, default=7.5)
    parser.add_argument('--num_inference_steps', type=int, default=50)
    parser.add_argument('--height', type=int, default=512)
    parser.add_argument('--width', type=int, default=512)

    args = parser.parse_args()

    main(args)